
## Reads the csv files and returns them as dataframes.

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# === PATH SETUP ===
# Get the absolute path of the directory where this script is located
_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# Go one level up to the project root, then into the data folder
DATA_DIR = os.path.join(_CURRENT_DIR, '..', 'Data_SIH_2025')

# === FUNCTION TO LOAD ALL SITE DATA ===
def load_site_data(site_no):
    train_path = os.path.join(DATA_DIR, f"site_{site_no}_train_data.csv")
    unseen_path = os.path.join(DATA_DIR, f"site_{site_no}_unseen_input_data.csv")

    train_df = pd.read_csv(train_path)
    unseen_df = pd.read_csv(unseen_path)

    # Clean whitespace in column names
    train_df.columns = train_df.columns.str.strip()
    unseen_df.columns = unseen_df.columns.str.strip()

    return train_df, unseen_df


# === PREPROCESS FUNCTION ===
def create_timestamp_index(df):
    """Creates a datetime index from time-related columns."""
    # Ensure columns are numeric
    time_cols = ['year', 'month', 'day', 'hour']
    for col in time_cols:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    # Drop rows with invalid time data
    df.dropna(subset=time_cols, inplace=True)
    
    # Create the timestamp index
    df['timestamp'] = pd.to_datetime(df[time_cols])
    df.set_index('timestamp', inplace=True)
    return df


# === PREPROCESS FUNCTION ===
def preprocess_data(df, scaler=None):
    """
    Preprocesses the data: fills missing values, separates features and targets,
    and scales the features. It also removes rows where target values are missing.
    """
    # 1. Handle missing satellite values in features
    satellite_cols = ['NO2_satellite', 'HCHO_satellite', 'ratio_satellite']
    for col in satellite_cols:
        if col in df.columns:
            # Use the mean of the column to fill missing values
            df[col] = df[col].fillna(df[col].mean())

    # 2. Define feature & target columns
    features = ['year', 'month', 'day', 'hour',
                'O3_forecast', 'NO2_forecast', 'T_forecast', 'q_forecast',
                'u_forecast', 'v_forecast', 'w_forecast',
                'NO2_satellite', 'HCHO_satellite', 'ratio_satellite']
    
    targets = ['O3_target', 'NO2_target']
    
    # Filter out features that are not in the dataframe columns
    available_features = [f for f in features if f in df.columns]
    
    # 3. Handle targets and remove rows with missing labels
    y = None
    if all(col in df.columns for col in targets):
        # Only keep rows where BOTH target values are present
        df.dropna(subset=targets, inplace=True)
        y = df[targets]

    X = df[available_features]

    # 4. Normalize features
    if scaler is None:
        # This is training mode: fit and transform
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        return X_scaled, y, scaler
    else:
        # This is prediction mode: only transform
        X_scaled = scaler.transform(X)
        return X_scaled, scaler # Always return 2 values in this branch


# === EXAMPLE: LOAD SITE 1 DATA ===
if __name__ == "__main__":
    site_no = 1
    train_df, unseen_df = load_site_data(site_no)
    
    print(f"✅ Loaded Site {site_no} — Train shape: {train_df.shape}, Unseen shape: {unseen_df.shape}")

    # Combine train and unseen for a complete historical dataset
    combined_df = pd.concat([train_df, unseen_df], ignore_index=True)
    combined_df = create_timestamp_index(combined_df)
    print(f"✅ Combined and indexed data shape: {combined_df.shape}")

    # === PREPROCESS THE COMBINED DATA ===
    X_scaled, y, scaler = preprocess_data(combined_df)
    print(f"✅ Preprocessed data — X shape: {X_scaled.shape}, y shape: {y.shape}")

    # === TRAIN/TEST SPLIT (on the full historical data) ===
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    print(f"Train samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")
    
    print("\n✅ Data parsing & preprocessing module is ready!")