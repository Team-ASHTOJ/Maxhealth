# main.py

## Uses both dataparse and data_modeling files as modules here.

# === IMPORTS ===
import DataParse
import data_modeling
from sklearn.model_selection import train_test_split
import json # <--- Import the json library

def run_pipeline_for_site(site_no):
    """
    Runs the complete data loading, preprocessing, training, and prediction pipeline for a single site.
    Saves both predictions and performance metrics to separate files.
    """
    print(f"\n--- Processing Site {site_no} ---")
    try:
        # 1. Load Data
        train_df, unseen_df = DataParse.load_site_data(site_no)
        print(f"✅ Loaded Site {site_no} — Train shape: {train_df.shape}, Unseen shape: {unseen_df.shape}")

        # 2. Preprocess Data
        X, y, scaler = DataParse.preprocess_data(train_df)
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
        print(f"Data split: {X_train.shape[0]} train samples, {X_test.shape[0]} test samples.")

        # Process the unseen data using the scaler fitted on the training data
        unseen_features = [
            'year', 'month', 'day', 'hour', 'O3_forecast', 'NO2_forecast', 'T_forecast',
            'q_forecast', 'u_forecast', 'v_forecast', 'w_forecast', 'NO2_satellite',
            'HCHO_satellite', 'ratio_satellite'
        ]
        
        train_mean = train_df[unseen_features].mean()
        unseen_df[unseen_features] = unseen_df[unseen_features].fillna(train_mean)
        X_unseen = scaler.transform(unseen_df[unseen_features])
        print("✅ Data parsing & preprocessing complete!")

        # 3. Train Models and get metrics
        models, metrics = data_modeling.train_xgboost_models(X_train, y_train, X_test, y_test)
        print("\n📊 Model Performance Summary (on Test Set):")
        for pollutant, scores in metrics.items():
            print(f"  - {pollutant}: RMSE={scores['RMSE']:.3f}, R²={scores['R2']:.3f}, RIA={scores['RIA']:.3f}")
        
        # 4. Save the calculated metrics to a JSON file
        metrics_file = f"metrics_site_{site_no}.json"
        with open(metrics_file, 'w') as f:
            json.dump(metrics, f, indent=4)
        print(f"✅ Metrics saved to {metrics_file}")

        # 5. Predict and Save Results for unseen data
        pred_df = data_modeling.predict_unseen(models, X_unseen, unseen_df, site_no)
        
        if 'timestamp' in pred_df.columns:
             print("\n=== Sample of Final Predictions ===")
             print(pred_df[['timestamp', 'O3_predicted', 'NO2_predicted']].head())
        
        print(f"--- Site {site_no} Finished Successfully ---")
        # Return both filenames on success
        return f"predictions_site_{site_no}.csv", metrics_file

    except FileNotFoundError:
        print(f"⚠️  Site {site_no} SKIPPED — A data file was not found.")
        return None, None
    except Exception as e:
        print(f"❌ ERROR processing site {site_no}: {e}")
        return None, None

# This block is the main entry point when you run "python main.py"
if __name__ == "__main__":
    print("--- Starting Air Quality Prediction Pipeline for All Sites ---")
    
    created_pred_files = []
    created_metrics_files = []
    
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