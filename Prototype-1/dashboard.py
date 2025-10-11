# dashboard.py

import streamlit as st
import pandas as pd
import plotly.express as px
import numpy as np
import json

st.set_page_config(page_title="Air Quality Forecast", layout="wide")

# ==============================================================================
# === NEW: HELPER FUNCTIONS FOR COMBINED ACCURACY SCORE ===
# ==============================================================================

def normalize_metric(value, good_thresh, bad_thresh, higher_is_better=False):
    """
    Normalizes a metric's value to a score between 0.0 (bad) and 1.0 (good).
    """
    # Handle the "higher is better" case (like R² and RIA)
    if higher_is_better:
        if value >= good_thresh: return 1.0
        if value <= bad_thresh: return 0.0
        # Linearly scale between bad and good thresholds
        return (value - bad_thresh) / (good_thresh - bad_thresh)
    
    # Handle the "lower is better" case (like RMSE, MAE, Bias)
    else:
        if value <= good_thresh: return 1.0
        if value >= bad_thresh: return 0.0
        # Linearly scale between good and bad thresholds
        return (bad_thresh - value) / (bad_thresh - good_thresh)

def calculate_combined_score(metrics_dict):
    """
    Calculates a single combined score from a dictionary of metrics.
    Returns the score (0-1) and a dictionary of individual normalized scores.
    """
    if not metrics_dict:
        return 0.0, {}

    # Define the scoring rubric (Good/Bad thresholds for each metric)
    rubric = {
        "RMSE": {"good": 10, "bad": 20, "higher_is_better": False},
        "MAE":  {"good": 8,  "bad": 16, "higher_is_better": False},
        "Bias": {"good": 1,  "bad": 5,  "higher_is_better": False}, # Using absolute value
        "R2":   {"good": 0.8,"bad": 0.5,"higher_is_better": True},
        "RIA":  {"good": 0.8,"bad": 0.5,"higher_is_better": True},
    }

    normalized_scores = {}
    
    # Calculate normalized score for each metric present in the input
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
        
    # The final score is the average of all individual normalized scores
    final_score = np.mean(list(normalized_scores.values()))
    
    return final_score, normalized_scores

# --- Data Loading Function (for predictions) ---
@st.cache_data
def load_data(site_no: int):
    """Loads prediction data for a given site."""
    pred_file = f"predictions/predictions_site_{site_no}.csv"
    try:
        df = pd.read_csv(pred_file)
    except FileNotFoundError:
        st.error(f"Prediction file not found: '{pred_file}'. Please run the main.py pipeline to generate predictions.")
        st.stop()
    df['timestamp'] = pd.to_datetime(df[['year', 'month', 'day', 'hour']])
    df = df.sort_values('timestamp').reset_index(drop=True)
    df = df.rename(columns={
        "O3_predicted": "O3_pred", 
        "NO2_predicted": "NO2_pred",
        "O3_target": "O3_true",
        "NO2_target": "NO2_true"
    })
    return df

# ==============================================================================
# === MODIFIED: Metrics Loading Function now calculates the combined score ===
# ==============================================================================
@st.cache_data
def load_all_metrics():
    """
    Loads all saved metrics, calculates a combined score for each, 
    and compiles them into a DataFrame.
    """
    all_metrics_records = []
    for s in range(1, 8):
        try:
            with open(f"metrics/metrics_site_{s}.json", 'r') as f:
                data = json.load(f)
                for pollutant, scores in data.items():
                    # --- THIS IS THE NEW PART ---
                    # Calculate the combined score using our new function
                    combined_score, norm_scores = calculate_combined_score(scores)
                    
                    # Create a record with all the original and new data
                    record = {
                        'site': s,
                        'pollutant': pollutant,
                        'RMSE': scores.get('RMSE'),
                        'R2': scores.get('R2'),
                        'RIA': scores.get('RIA'),
                        'MAE': scores.get('MAE'),
                        'Bias': scores.get('Bias'),
                        'combined_score': combined_score,
                        **{f'{k}_score': v for k, v in norm_scores.items()} # Add individual normalized scores too
                    }
                    all_metrics_records.append(record)
        except FileNotFoundError:
            continue
    
    if not all_metrics_records:
        return pd.DataFrame()
        
    return pd.DataFrame(all_metrics_records)

# --- Sidebar Controls ---
st.sidebar.header("Dashboard Controls")
site_no = st.sidebar.selectbox("Select Site", [1, 2, 3, 4, 5, 6, 7], index=0)
pollutant = st.sidebar.selectbox("Select Pollutant", ["O3", "NO2"])

# Load the data for the selected site
df = load_data(site_no)

#==============================================================================
#=== NEW & IMPROVED: METRICS DISPLAY using the Combined Score ===
#==============================================================================
st.sidebar.header("Model Performance Score")

# Load all metrics
metrics_df = load_all_metrics()

if metrics_df.empty:
    st.sidebar.warning("Metrics files not found. Run main.py to generate them.")
else:
    # Match the sidebar selection ("O3") to the data column ("O3_target")
    pollutant_target_name = f"{pollutant}_target"

    # --- THIS IS THE KEY CHANGE ---
    # Filter for the specific pollutant AND the specific site selected in the sidebar
    site_specific_metrics = metrics_df[
        (metrics_df['pollutant'] == pollutant_target_name) &
        (metrics_df['site'] == site_no)
    ]

    # Check if we found a record for this specific site/pollutant combo
    if not site_specific_metrics.empty:
        # We expect only one row, so get it using .iloc[0]
        metrics_row = site_specific_metrics.iloc[0]
        
        # --- DISPLAY THE MAIN SCORE (now specific to the site) ---
        st.sidebar.metric(
            label=f"{pollutant} Accuracy for Site {site_no}", # <-- Changed label to be specific
            value=f"{metrics_row['combined_score'] * 100:.1f}%" # <-- Use the score from the specific row
        )
        st.sidebar.caption("An overall score for this specific site and pollutant.") # <-- Updated caption

        # --- DISPLAY A DETAILED BREAKDOWN for the selected site ---
        # The logic here was already correct, but we'll use our new 'metrics_row' variable
        with st.sidebar.expander(f"See score breakdown for Site {site_no}"):
            st.markdown("Raw Values vs. **Normalized Score (0-1)**")
            
            # Display each metric and its normalized score
            col1, col2 = st.columns(2)
            col1.metric("RMSE", f"{metrics_row['RMSE']:.2f}")
            col2.metric("Score", f"{metrics_row['RMSE_score']:.2f}")

            col1.metric("R²", f"{metrics_row['R2']:.2f}")
            col2.metric("Score", f"{metrics_row['R2_score']:.2f}")
            
            col1.metric("RIA", f"{metrics_row['RIA']:.2f}")
            col2.metric("Score", f"{metrics_row['RIA_score']:.2f}")
            
            col1.metric("MAE", f"{metrics_row['MAE']:.2f}")
            col2.metric("Score", f"{metrics_row['MAE_score']:.2f}")

            col1.metric("Bias", f"{metrics_row['Bias']:.2f}")
            col2.metric("Score", f"{metrics_row['Bias_score']:.2f}")
            
    else:
        # This message now correctly states that metrics are missing for the specific selection
        st.sidebar.info(f"No metrics available for {pollutant} at Site {site_no}.")


horizon_map = {"Next 24 hours": 24, "Next 48 hours": 48, "Next 7 days": 168}
selected_horizon = st.sidebar.radio("Select Forecast Horizon", list(horizon_map.keys()))
num_hours = horizon_map[selected_horizon]
display_df = df.head(num_hours)

# --- Main Page Layout ---
st.title(f"🌆 Delhi Air Quality Forecast — Site {site_no}")
st.markdown(f"Hourly forecasts for **O₃** and **NO₂** concentrations at Site {site_no}.")

st.header(f"Forecast for {pollutant}")
st.markdown(f"Showing predicted and observed **{pollutant}** levels for the **{selected_horizon}**.")

fig = px.line(
    display_df,
    x="timestamp",
    y=[c for c in [f"{pollutant}_true", f"{pollutant}_pred"] if c in display_df.columns],
    labels={"timestamp": "Date and Time", "value": f"{pollutant} (µg/m³)"},
    title=f"Observed vs. Predicted {pollutant} Levels",
    template="plotly_white"
)
for t in fig.data:
    if t.name == f"{pollutant}_pred":
        t.update(line=dict(dash='dash'))
st.plotly_chart(fig, use_container_width=True)

st.header("Forecast Heatmap")
st.markdown("Visualizing pollutant concentration by hour of the day over the forecast period.")

heat_df = display_df.copy()
heat_df['Date'] = heat_df['timestamp'].dt.date
heat_df['Hour'] = heat_df['timestamp'].dt.hour

if f"{pollutant}_pred" in heat_df.columns:
    try:
        pivot_table = heat_df.pivot_table(values=f"{pollutant}_pred", index="Date", columns="Hour")
        fig2 = px.imshow(
            pivot_table,
            color_continuous_scale="RdYlGn_r",
            labels=dict(x="Hour of Day", y="Date", color=f"{pollutant} (µg/m³)"),
            title=f"Hourly Predicted {pollutant} Concentration",
            template="plotly_white"
        )
        st.plotly_chart(fig2, use_container_width=True)
    except Exception as e:
        st.warning(f"Could not generate heatmap. Reason: {e}")
else:
    st.info(f"No predicted {pollutant} values available to generate heatmap for Site {site_no}.")

# --- Data Download ---
st.sidebar.header("Download Data")
csv = display_df.to_csv(index=False).encode('utf-8')
st.sidebar.download_button(
    label="📥 Download Forecast Data",
    data=csv,
    file_name=f"forecast_{site_no}_{pollutant}_{num_hours}hrs.csv",
    mime="text/csv"
)