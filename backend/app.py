from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
import pandas as pd
import json
import numpy as np
import httpx
from datetime import datetime
import asyncio
from pathlib import Path
import os

# Get the absolute path of the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = FastAPI(title="Air Quality Forecast API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for feedback (use SQLite/MongoDB in production)
feedback_store = []

# ============================================================================
# MODELS
# ============================================================================

class FeedbackCreate(BaseModel):
    site: int
    feeling: str  # "fresh", "smoky", "dusty", "normal"
    description: Optional[str] = None
    timestamp: Optional[str] = None

class UserProfile(BaseModel):
    age_group: str
    conditions: List[str] = []

class HealthRequest(BaseModel):
    aqi: int
    profile: UserProfile

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def normalize_metric(value, good_thresh, bad_thresh, higher_is_better=False):
    """Normalizes a metric's value to a score between 0.0 and 1.0."""
    if higher_is_better:
        if value >= good_thresh: return 1.0
        if value <= bad_thresh: return 0.0
        return (value - bad_thresh) / (good_thresh - bad_thresh)
    else:
        if value <= good_thresh: return 1.0
        if value >= bad_thresh: return 0.0
        return (bad_thresh - value) / (bad_thresh - good_thresh)

def calculate_combined_score(metrics_dict):
    """Calculates a single combined score from metrics."""
    if not metrics_dict:
        return 0.0, {}

    rubric = {
        "RMSE": {"good": 12, "bad": 20, "higher_is_better": False},
        "MAE":  {"good": 9,  "bad": 16, "higher_is_better": False},
        "Bias": {"good": 1,  "bad": 5,  "higher_is_better": False},
        "R2":   {"good": 0.8,"bad": 0.5,"higher_is_better": True},
        "RIA":  {"good": 0.8,"bad": 0.5,"higher_is_better": True},
    }

    normalized_scores = {}
    
    for metric, params in rubric.items():
        if metric in metrics_dict and metrics_dict[metric] is not None:
            value = abs(metrics_dict[metric]) if metric == "Bias" else metrics_dict[metric]
            score = normalize_metric(
                value,
                params["good"],
                params["bad"],
                params["higher_is_better"]
            )
            normalized_scores[metric] = score

    if not normalized_scores:
        return 0.0, {}
        
    final_score = np.mean(list(normalized_scores.values()))
    return final_score, normalized_scores

def get_health_recommendation(aqi: int, user_profile: UserProfile) -> Dict:
    """Generate personalized health recommendations based on AQI and user profile."""
    recommendations = {
        "activity_level": "",
        "outdoor_advice": "",
        "health_tips": [],
        "risks": [],
        "severity": "",
        "activity_level_key": "",
        "outdoor_advice_key": ""
    }
    
    is_sensitive = user_profile.age_group in ["child", "elderly"] or \
                   any(c in ["asthma", "heart_disease", "respiratory"] for c in user_profile.conditions)
    
    if aqi <= 50:  # Good
        recommendations["severity"] = "good"
        recommendations["activity_level"] = "Full outdoor activities recommended"
        recommendations["activity_level_key"] = "rec_activity_full"
        recommendations["outdoor_advice"] = "Perfect day for jogging, cycling, and outdoor sports!"
        recommendations["outdoor_advice_key"] = "rec_outdoor_perfect"
        recommendations["health_tips"] = [{"key": "rec_tip_enjoy_fresh_air", "text": "Enjoy the fresh air!"}]
        recommendations["risks"] = [{"key": "rec_risk_no_specific", "text": "No specific health risks for the general population."}]

    elif aqi <= 100:  # Moderate
        recommendations["severity"] = "moderate"
        recommendations["risks"] = [{"key": "rec_risk_sensitive_symptoms", "text": "Unusually sensitive people may experience minor respiratory symptoms."}]
        if is_sensitive:
            recommendations["activity_level"] = "Light to moderate activities"
            recommendations["activity_level_key"] = "rec_activity_light"
            recommendations["outdoor_advice"] = "Consider reducing prolonged outdoor exertion"
            recommendations["outdoor_advice_key"] = "rec_outdoor_reduce"
            recommendations["health_tips"] = [{"key": "rec_tip_take_breaks", "text": "Take breaks during outdoor activities"}]
        else:
            recommendations["activity_level"] = "Normal outdoor activities"
            recommendations["activity_level_key"] = "rec_activity_normal"
            recommendations["outdoor_advice"] = "Safe for most outdoor activities"
            recommendations["outdoor_advice_key"] = "rec_outdoor_safe"
            recommendations["health_tips"] = [{"key": "rec_tip_aqi_acceptable", "text": "Air quality is acceptable"}]

    elif aqi <= 150:  # Unhealthy for Sensitive Groups
        recommendations["severity"] = "unhealthy_sensitive"
        recommendations["risks"] = [
            {"key": "rec_risk_sensitive_respiratory", "text": "Increased likelihood of respiratory symptoms in sensitive individuals."},
            {"key": "rec_risk_sensitive_aggravation", "text": "Aggravation of heart or lung disease and premature mortality in persons with cardiopulmonary disease and the elderly."}
        ]
        if is_sensitive:
            recommendations["activity_level"] = "Reduce outdoor activities"
            recommendations["activity_level_key"] = "rec_activity_reduce"
            recommendations["outdoor_advice"] = "Avoid prolonged outdoor exertion"
            recommendations["outdoor_advice_key"] = "rec_outdoor_avoid_prolonged"
            recommendations["health_tips"] = [
                {"key": "rec_tip_stay_indoors_possible", "text": "Stay indoors if possible"},
                {"key": "rec_tip_use_purifiers", "text": "Use air purifiers at home"}
            ]
        else:
            recommendations["activity_level"] = "Moderate outdoor activities acceptable"
            recommendations["activity_level_key"] = "rec_activity_moderate"
            recommendations["outdoor_advice"] = "Consider reducing intense outdoor activities"
            recommendations["outdoor_advice_key"] = "rec_outdoor_reduce_intense"
            recommendations["health_tips"] = [{"key": "rec_tip_monitor_symptoms", "text": "Monitor for symptoms like coughing"}]

    elif aqi <= 200:  # Unhealthy
        recommendations["severity"] = "unhealthy"
        recommendations["activity_level"] = "Avoid outdoor activities"
        recommendations["activity_level_key"] = "rec_activity_avoid"
        recommendations["outdoor_advice"] = "Everyone should avoid prolonged outdoor exertion"
        recommendations["outdoor_advice_key"] = "rec_outdoor_everyone_avoid"
        recommendations["risks"] = [
            {"key": "rec_risk_aggravation", "text": "Increased aggravation of heart or lung disease."},
            {"key": "rec_risk_widespread_respiratory", "text": "Widespread respiratory effects in the general population."}
        ]
        recommendations["health_tips"] = [
            {"key": "rec_tip_stay_indoors_filtered", "text": "Stay indoors with filtered air"},
            {"key": "rec_tip_wear_n95", "text": "Wear N95 masks if you must go outside"},
        ]

    elif aqi <= 300:  # Very Unhealthy
        recommendations["severity"] = "very_unhealthy"
        recommendations["activity_level"] = "Stay indoors"
        recommendations["activity_level_key"] = "rec_activity_stay_indoors"
        recommendations["outdoor_advice"] = "Avoid all outdoor activities"
        recommendations["outdoor_advice_key"] = "rec_outdoor_avoid_all"
        recommendations["risks"] = [
            {"key": "rec_risk_sig_aggravation", "text": "Significant aggravation of heart or lung disease."},
            {"key": "rec_risk_increased_respiratory", "text": "Increased respiratory effects in general population."},
            {"key": "rec_risk_serious_mortality", "text": "Serious risk of premature mortality in persons with cardiopulmonary disease and the elderly."}
        ]
        recommendations["health_tips"] = [
            {"key": "rec_tip_emergency_indoors", "text": "Emergency: Stay indoors with air purification"},
            {"key": "rec_tip_wear_n99", "text": "Wear N95/N99 masks if outdoor exposure is unavoidable"},
        ]

    else:  # Hazardous
        recommendations["severity"] = "hazardous"
        recommendations["activity_level"] = "Remain indoors - health emergency"
        recommendations["activity_level_key"] = "rec_activity_emergency"
        recommendations["outdoor_advice"] = "Do not go outside unless absolutely necessary"
        recommendations["outdoor_advice_key"] = "rec_outdoor_no_go"
        recommendations["risks"] = [
            {"key": "rec_risk_serious_respiratory", "text": "Serious risk of respiratory effects in general population."},
            {"key": "rec_risk_hazardous_all", "text": "Hazardous for all individuals, especially those with existing conditions."}
        ]
        recommendations["health_tips"] = [
            {"key": "rec_tip_health_alert", "text": "HEALTH ALERT: Hazardous air quality"},
            {"key": "rec_tip_clean_room", "text": "Create a clean room with air purifiers"},
            {"key": "rec_tip_follow_advisories", "text": "Follow official health advisories"}
        ]
    
    return recommendations

# ============================================================================
# API ROUTES
# ============================================================================

@app.get("/")
async def root():
    return {"message": "Air Quality Forecast API", "version": "1.0.0"}

@app.get("/api/sites")
async def get_sites():
    """Get list of available monitoring sites."""
    return {"sites": [1, 2, 3, 4, 5, 6, 7]}

@app.get("/api/data/site/{site_id}")
async def get_site_data(site_id: int, horizon: int = 24):
    """Get prediction data for a specific site."""
    if site_id not in range(1, 8):
        raise HTTPException(status_code=404, detail="Site not found")
    
    pred_file = os.path.join(BASE_DIR, "predictions", f"predictions_site_{site_id}.csv")
    
    try:
        df = pd.read_csv(pred_file)
        df['timestamp'] = pd.to_datetime(df[['year', 'month', 'day', 'hour']])
        df = df.sort_values('timestamp').reset_index(drop=True)
        df = df.rename(columns={
            "O3_predicted": "O3_pred", 
            "NO2_predicted": "NO2_pred",
            "O3_target": "O3_true",
            "NO2_target": "NO2_true"
        })
        
        # Limit to forecast horizon
        df = df.head(horizon)
        
        # Replace NaN with None for JSON compatibility
        df = df.replace({np.nan: None})

        # Convert to JSON-friendly format
        df['timestamp'] = df['timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S')
        
        return {
            "site": site_id,
            "horizon": horizon,
            "data": df.to_dict(orient='records')
        }
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, 
            detail=f"Prediction file not found for site {site_id}"
        )

@app.get("/api/metrics/site/{site_id}")
async def get_site_metrics(site_id: int, pollutant: str = "O3"):
    """Get model performance metrics for a specific site and pollutant."""
    if site_id not in range(1, 8):
        raise HTTPException(status_code=404, detail="Site not found")
    
    metrics_file = os.path.join(BASE_DIR, "metrics", f"metrics_site_{site_id}.json")
    
    try:
        with open(metrics_file, 'r') as f:
            data = json.load(f)
        
        pollutant_key = f"{pollutant}_target"
        
        if pollutant_key not in data:
            raise HTTPException(
                status_code=404, 
                detail=f"Metrics not found for {pollutant} at site {site_id}"
            )
        
        metrics = data[pollutant_key]
        combined_score, normalized_scores = calculate_combined_score(metrics)
        
        return {
            "site": site_id,
            "pollutant": pollutant,
            "metrics": metrics,
            "combined_score": combined_score,
            "normalized_scores": normalized_scores
        }
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, 
            detail=f"Metrics file not found for site {site_id}"
        )

@app.get("/api/metrics/all")
async def get_all_metrics():
    """Get metrics for all sites and pollutants."""
    all_metrics = []
    
    for site_id in range(1, 8):
        try:
            metrics_file = os.path.join(BASE_DIR, "metrics", f"metrics_site_{site_id}.json")
            with open(metrics_file, 'r') as f:
                data = json.load(f)
            
            for pollutant, scores in data.items():
                combined_score, norm_scores = calculate_combined_score(scores)
                
                record = {
                    'site': site_id,
                    'pollutant': pollutant,
                    'RMSE': scores.get('RMSE'),
                    'R2': scores.get('R2'),
                    'RIA': scores.get('RIA'),
                    'MAE': scores.get('MAE'),
                    'Bias': scores.get('Bias'),
                    'combined_score': combined_score,
                    'normalized_scores': norm_scores
                }
                all_metrics.append(record)
        except FileNotFoundError:
            continue
    
    return {"metrics": all_metrics}

@app.get("/api/aqi/current")
async def get_current_aqi(lat: float = 28.6139, lon: float = 77.2090):
    """
    Fetch real-time AQI data from external API.
    Default coordinates are for Delhi, India.
    """
    # Using OpenWeatherMap Air Pollution API (free tier)
    # You'll need to sign up at openweathermap.org and get an API key
    API_KEY = "YOUR_OPENWEATHERMAP_API_KEY"  # Replace with your key
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"http://api.openweathermap.org/data/2.5/air_pollution",
                params={"lat": lat, "lon": lon, "appid": API_KEY},
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                aqi_data = data['list'][0]
                
                # OpenWeatherMap uses 1-5 scale, convert to US EPA scale (0-500)
                aqi_map = {1: 25, 2: 75, 3: 125, 4: 175, 5: 275}
                aqi = aqi_map.get(aqi_data['main']['aqi'], 100)
                
                return {
                    "aqi": aqi,
                    "timestamp": datetime.utcnow().isoformat(),
                    "location": {"lat": lat, "lon": lon},
                    "components": aqi_data['components'],
                    "category": get_aqi_category(aqi)
                }
            else:
                # Fallback to mock data if API fails
                return get_mock_aqi_data()
    
    except Exception as e:
        # Return mock data on error
        return get_mock_aqi_data()

def get_mock_aqi_data():
    """Return mock AQI data for testing."""
    mock_aqi = np.random.randint(50, 200)
    return {
        "aqi": mock_aqi,
        "timestamp": datetime.utcnow().isoformat(),
        "location": {"lat": 28.6139, "lon": 77.2090},
        "components": {
            "pm2_5": float(np.random.uniform(20, 100)),
            "pm10": float(np.random.uniform(30, 150)),
            "o3": float(np.random.uniform(10, 80)),
            "no2": float(np.random.uniform(20, 100))
        },
        "category": get_aqi_category(mock_aqi),
        "mock": True
    }

def get_aqi_category(aqi: int) -> Dict:
    """Convert AQI value to category with color."""
    if aqi <= 50:
        return {"level": "Good", "levelKey": "aqi_level_good", "color": "#00e400", "description": "Air quality is satisfactory", "descriptionKey": "aqi_desc_good"}
    elif aqi <= 100:
        return {"level": "Moderate", "levelKey": "aqi_level_moderate", "color": "#ffff00", "description": "Air quality is acceptable", "descriptionKey": "aqi_desc_moderate"}
    elif aqi <= 150:
        return {"level": "Unhealthy for Sensitive Groups", "levelKey": "aqi_level_unhealthy_sensitive", "color": "#ff7e00", "description": "Sensitive groups may experience health effects", "descriptionKey": "aqi_desc_unhealthy_sensitive"}
    elif aqi <= 200:
        return {"level": "Unhealthy", "levelKey": "aqi_level_unhealthy", "color": "#ff0000", "description": "Everyone may begin to experience health effects", "descriptionKey": "aqi_desc_unhealthy"}
    elif aqi <= 300:
        return {"level": "Very Unhealthy", "levelKey": "aqi_level_very_unhealthy", "color": "#8f3f97", "description": "Health alert: everyone may experience serious health effects", "descriptionKey": "aqi_desc_very_unhealthy"}
    else:
        return {"level": "Hazardous", "levelKey": "aqi_level_hazardous", "color": "#7e0023", "description": "Health warning of emergency conditions", "descriptionKey": "aqi_desc_hazardous"}

@app.post("/api/health-recommendations")
async def get_health_recommendations(request: HealthRequest):
    """Get personalized health recommendations based on AQI and user profile."""
    recommendations = get_health_recommendation(request.aqi, request.profile)
    return {
        "aqi": request.aqi,
        "profile": request.profile.dict(),
        "recommendations": recommendations,
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/feedback")
async def submit_feedback(feedback: FeedbackCreate):
    """Submit crowdsourced air quality feedback."""
    feedback_entry = feedback.dict()
    feedback_entry['timestamp'] = datetime.utcnow().isoformat()
    feedback_entry['id'] = len(feedback_store) + 1
    
    feedback_store.append(feedback_entry)
    
    return {
        "message": "Feedback submitted successfully",
        "feedback": feedback_entry
    }

@app.get("/api/feedback")
async def get_feedback(site: Optional[int] = None, limit: int = 50):
    """Get recent crowdsourced feedback."""
    filtered_feedback = feedback_store
    
    if site:
        filtered_feedback = [f for f in feedback_store if f['site'] == site]
    
    # Return most recent first
    filtered_feedback = sorted(
        filtered_feedback, 
        key=lambda x: x['timestamp'], 
        reverse=True
    )[:limit]
    
    return {"feedback": filtered_feedback, "count": len(filtered_feedback)}

@app.get("/api/download/forecast/{site_id}")
async def download_forecast(site_id: int, pollutant: str = "O3", horizon: int = 24):
    """Generate and return CSV file for download."""
    if site_id not in range(1, 8):
        raise HTTPException(status_code=404, detail="Site not found")
    
    pred_file = os.path.join(BASE_DIR, "predictions", f"predictions_site_{site_id}.csv")
    
    try:
        df = pd.read_csv(pred_file)
        df['timestamp'] = pd.to_datetime(df[['year', 'month', 'day', 'hour']])
        df = df.sort_values('timestamp').reset_index(drop=True)
        df = df.head(horizon)
        
        # Create temporary CSV in the same base directory
        temp_dir = os.path.join(BASE_DIR, "temp")
        os.makedirs(temp_dir, exist_ok=True)
        output_file = os.path.join(temp_dir, f"temp_forecast_{site_id}_{pollutant}_{horizon}hrs.csv")
        df.to_csv(output_file, index=False)
        
        return FileResponse(
            output_file,
            media_type='text/csv',
            filename=f"forecast_{site_id}_{pollutant}_{horizon}hrs.csv"
        )
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=404, 
            detail=f"Prediction file not found for site {site_id}"
        )

# ============================================================================
# BACKGROUND TASKS (Optional: for periodic AQI updates)
# ============================================================================

aqi_cache = {}

async def update_aqi_cache():
    """Background task to update AQI cache periodically."""
    while True:
        try:
            # Update AQI for Delhi coordinates
            lat, lon = 28.6139, 77.2090
            aqi_data = await get_current_aqi(lat, lon)
            aqi_cache['delhi'] = aqi_data
        except Exception as e:
            print(f"Error updating AQI cache: {e}")
        
        # Wait 30 minutes before next update
        await asyncio.sleep(1800)

@app.on_event("startup")
async def startup_event():
    """Initialize background tasks on startup."""
    # Uncomment to enable background AQI updates
    # asyncio.create_task(update_aqi_cache())
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)