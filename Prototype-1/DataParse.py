
## Reads the csv files and returns them as dataframes.

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

# === PATH SETUP ===
DATA_DIR = "DATA_SIH_2025"   # folder containing site_1_train_data.csv ... site_7_unseen_data.csv

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
def preprocess_data(df):
    # 1. Handle missing satellite values (either drop or fill with mean)
    df[['NO2_satellite','HCHO_satellite','ratio_satellite']] = df[['NO2_satellite','HCHO_satellite','ratio_satellite']].fillna(df.mean())

    # 2. Define feature & target columns
    features = ['year','month','day','hour',
                'O3_forecast','NO2_forecast','T_forecast','q_forecast',
                'u_forecast','v_forecast','w_forecast',
                'NO2_satellite','HCHO_satellite','ratio_satellite']
    targets = ['O3_target','NO2_target']

    # 3. Split X, y
    X = df[features]
    y = df[targets]

    # 4. Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return X_scaled, y, scaler


# === EXAMPLE: LOAD SITE 1 DATA ===
site_no = 1
train_df, unseen_df = load_site_data(site_no)

print(f"✅ Loaded Site {site_no} — Train shape: {train_df.shape}, Unseen shape: {unseen_df.shape}")

# === CLEAN TRAIN DATA ===
X, y, scaler = preprocess_data(train_df)

# === TRAIN/TEST SPLIT (75-25) ===
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

print(f"Train samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")

# === PROCESS UNSEEN DATA (no targets) ===
unseen_features = ['year','month','day','hour',
                   'O3_forecast','NO2_forecast','T_forecast','q_forecast',
                   'u_forecast','v_forecast','w_forecast',
                   'NO2_satellite','HCHO_satellite','ratio_satellite']

unseen_df[unseen_features] = unseen_df[unseen_features].fillna(unseen_df.mean())
X_unseen = scaler.transform(unseen_df[unseen_features])

print("✅ Data parsing & preprocessing complete!")

if __name__ == "__main__":
    # === EXAMPLE: LOAD SITE 1 DATA ===
    site_no = 1
    train_df, unseen_df = load_site_data(site_no)
    
    print(f"✅ Loaded Site {site_no} — Train shape: {train_df.shape}, Unseen shape: {unseen_df.shape}")
    
    # === CLEAN TRAIN DATA ===
    X, y, scaler = preprocess_data(train_df)
    
    # === TRAIN/TEST SPLIT (75-25) ===
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
    
    print(f"Train samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")
    
    # === PROCESS UNSEEN DATA (no targets) ===
    unseen_features = ['year','month','day','hour',
                       'O3_forecast','NO2_forecast','T_forecast','q_forecast',
                       'u_forecast','v_forecast','w_forecast',
                       'NO2_satellite','HCHO_satellite','ratio_satellite']
    
    unseen_df[unseen_features] = unseen_df[unseen_features].fillna(unseen_df.mean())
    X_unseen = scaler.transform(unseen_df[unseen_features])
    
    print("✅ Data parsing & preprocessing complete!")