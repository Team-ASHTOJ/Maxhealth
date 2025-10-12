# main.py

# === IMPORTS ===
import os
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from sklearn.model_selection import train_test_split

# Import your custom modules
import DataParse
import data_modeling

# --- CONFIGURATION ---
# Get the absolute path of the directory where this script is located
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# How many hours into the future do you want to predict?
FORECAST_HOURS = 48 

# --- HELPER FUNCTION TO CREATE FUTURE DATA ---
def generate_future_features(historical_df, hours_to_forecast):
    """
    Generates a DataFrame with plausible input features for future timestamps.
    It uses the last known data point as a template and starts from a defined future date.
    """
    print(f"🔩 Synthesizing input features for the next {hours_to_forecast} hours...")
    
    # Ensure the historical_df is sorted by time to get the actual last known row
    historical_df = historical_df.sort_index()
    last_known_row = historical_df.iloc[-1:].copy()
    
    # --- MODIFIED: Start forecast from the requested date ---
    # The forecast will begin on October 12, 2025, as requested.
    forecast_start_date = datetime(2025, 10, 12, 0)
    
    future_rows = []
    for i in range(hours_to_forecast): # Loop for 48 hours starting from hour 0
        future_timestamp = forecast_start_date + timedelta(hours=i)
        new_row = last_known_row.copy()
        
        # Update the time features IN THE COLUMNS
        new_row['year'] = future_timestamp.year
        new_row['month'] = future_timestamp.month
        new_row['day'] = future_timestamp.day
        new_row['hour'] = future_timestamp.hour
        
        # Add slight random variation to make the forecast look more realistic
        for col in ['O3_forecast', 'NO2_forecast', 'T_forecast', 'q_forecast', 
                    'u_forecast', 'v_forecast', 'w_forecast', 'NO2_satellite', 
                    'HCHO_satellite', 'ratio_satellite']:
            if col in new_row and pd.api.types.is_numeric_dtype(new_row[col]):
                variation = 1 + np.random.uniform(-0.02, 0.02) # +/- 2% change per hour
                new_row[col] *= variation
        
        future_rows.append(new_row)
        
    # Concatenate and reset the index to make it a clean DataFrame
    future_df = pd.concat(future_rows)
    return future_df.reset_index(drop=True)


def run_pipeline_for_site(site_no):
    """
    Runs the complete data loading, preprocessing, training, and prediction pipeline for a single site.
    Saves both predictions and performance metrics to separate files.
    """
    print(f"\n--- Processing Site {site_no} ---")
    try:
        # 1. Load and Combine All Historical Data
        train_df_from_file, unseen_df_from_file = DataParse.load_site_data(site_no)
        
        # Combine all available data for training
        historical_df = pd.concat([train_df_from_file, unseen_df_from_file.drop(columns=['O3_target', 'NO2_target'], errors='ignore')], ignore_index=True)
        historical_df = DataParse.create_timestamp_index(historical_df)
        print(f"✅ Loaded and combined historical data for Site {site_no} — Total shape: {historical_df.shape}")

        # 2. Preprocess Historical Data for Training and Evaluation
        # The preprocessor will handle separating X and y
        X_historical, y_historical, scaler = DataParse.preprocess_data(historical_df.reset_index())
        print("✅ Historical data preprocessed.")
        
        # 3. (Goal 2) Train Model and Evaluate Performance on a held-out test set
        X_train, X_test, y_train, y_test = train_test_split(X_historical, y_historical, test_size=0.2, random_state=42, shuffle=False) # shuffle=False for time series
        print(f"🧠 Training model on {X_train.shape[0]} samples, testing on {X_test.shape[0]} samples.")
        
        models, metrics = data_modeling.train_xgboost_models(X_train, y_train, X_test, y_test)
        
        # Save the metrics to a JSON file inside the backend directory
        metrics_dir = os.path.join(BASE_DIR, "metrics")
        os.makedirs(metrics_dir, exist_ok=True)
        metrics_file = os.path.join(metrics_dir, f"metrics_site_{site_no}.json")
        with open(metrics_file, 'w') as f:
            json.dump(metrics, f, indent=4)
        print(f"✅ Accuracy metrics saved to {metrics_file}")

        # 4. (Goal 1) Generate the Forecast for the next 48 hours
        future_features_df = generate_future_features(historical_df, hours_to_forecast=FORECAST_HOURS)
        
        # Preprocess these future features using the *same scaler*
        # This call only returns two values because the future DF has no target columns
        X_future_scaled, scaler = DataParse.preprocess_data(future_features_df, scaler=scaler)
        print("✅ Future features preprocessed for prediction.")

        # Make the predictions
        future_predictions = data_modeling.predict(models, X_future_scaled)
        
        # Combine predictions with the future features DataFrame
        future_features_df['O3_predicted'] = future_predictions['O3_target']
        future_features_df['NO2_predicted'] = future_predictions['NO2_target']

        # Save the forecast to a CSV file inside the backend directory
        predictions_dir = os.path.join(BASE_DIR, "predictions")
        os.makedirs(predictions_dir, exist_ok=True)
        forecast_file = os.path.join(predictions_dir, f"predictions_site_{site_no}.csv")
        future_features_df.to_csv(forecast_file, index=False)
        print(f"✅ Future forecast saved to {forecast_file}")
        
        print("\n=== Sample of Final Forecast ===")
        print(future_features_df[['year', 'month', 'day', 'hour', 'O3_predicted', 'NO2_predicted']].head())
        print(f"--- Site {site_no} Finished Successfully ---")
        
        return forecast_file, metrics_file

    except FileNotFoundError:
        print(f"⚠️  Site {site_no} SKIPPED — A data file was not found.")
        return None, None
    except Exception as e:
        print(f"❌ ERROR processing site {site_no}: {e}")
        import traceback
        traceback.print_exc()
        return None, None

# This block is the main entry point when you run "python main.py"
if __name__ == "__main__":
    print("--- Starting Air Quality Prediction Pipeline for All Sites ---")
    
    created_pred_files = []
    created_metrics_files = []
    
    # Loop through all 7 sites
    for site_id in range(1, 8):
        pred_file, metrics_file = run_pipeline_for_site(site_id)
        if pred_file:
            created_pred_files.append(pred_file)
        if metrics_file:
            created_metrics_files.append(metrics_file)
            
    print("\n--- ✅ PIPELINE FINISHED ---")
    if created_pred_files:
        print("Successfully created prediction files:")
        for f in created_pred_files:
            print(f"  - {f}")
    else:
        print("No prediction files were created.")

    if created_metrics_files:
        print("\nSuccessfully created metrics files:")
        for f in created_metrics_files:
            print(f"  - {f}")
    else:
        print("No metrics files were created.")