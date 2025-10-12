# data-modeling.py

## For training and generation of predictions.

## Calculation engine, contains the raw formulas and the functions that compute the metrics.

# === IMPORTS ===
import joblib 
import numpy as np
import pandas as pd
from xgboost import XGBRegressor
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error # NEW: Added mean_absolute_error
from sklearn.model_selection import train_test_split as sk_split

# This script contains functions for training XGBoost models and making predictions.
# It is intended to be imported by another script (like main.py).

# --- RIA METRIC FUNCTION ---
def refined_index_of_agreement(y_true, y_pred):
    """Compute Refined Index of Agreement (RIA)"""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    mean_obs = np.mean(y_true)
    numerator = np.sum(np.abs(y_pred - y_true))
    denominator = np.sum(np.abs(y_pred - mean_obs) + np.abs(y_true - mean_obs))
    if denominator == 0:
        return 1.0 # Perfect agreement if denominator is 0
    return 1 - (numerator / denominator)

# === NEW: Centralized Metrics Calculation Function ===
def calculate_metrics(y_true, y_pred):
    """Calculates a dictionary of regression metrics."""
    # Ensure NaN values are handled, in case the true data has gaps
    mask = ~np.isnan(y_true)
    y_true = y_true[mask]
    y_pred = y_pred[mask]

    if len(y_true) == 0:
        return {"RMSE": np.nan, "R2": np.nan, "RIA": np.nan, "MAE": np.nan, "Bias": np.nan}

    metrics = {
        "RMSE": np.sqrt(mean_squared_error(y_true, y_pred)),
        "R2": r2_score(y_true, y_pred),
        "RIA": refined_index_of_agreement(y_true, y_pred),
        "MAE": mean_absolute_error(y_true, y_pred),
        "Bias": np.mean(y_pred - y_true) # Mean Error
    }
    return metrics

# === TRAIN TWO MODELS: O3_target and NO2_target ===
def train_xgboost_models(X_train, y_train, X_test, y_test):
    """Trains an XGBoost regressor for each target column with early stopping and tuned hyperparameters."""
    results = {}
    models = {}

    for target in y_train.columns:
        print(f"\n💨 Training model for {target}...")

        # Split a small validation set from the training data for early stopping (no leakage from test)
        X_tr, X_val, y_tr, y_val = sk_split(X_train, y_train[target], test_size=0.1, random_state=42)

               # === A MORE BALANCED AND FASTER CONFIGURATION ===
        model = XGBRegressor(
            # Reduced estimators, but increased learning rate to compensate
            n_estimators=5000,
            learning_rate=0.03,
            max_depth=7,
            min_child_weight=3,
            subsample=0.85,
            colsample_bytree=0.9,
            reg_lambda=1.2,
            reg_alpha=0.0,
            gamma=0.0,
            objective="reg:squarederror",
            eval_metric="rmse",
            tree_method="hist",
            grow_policy="lossguide",
            random_state=42,
            n_jobs=-1,      # Use all available CPU cores
        )

        # Early stopping is now even MORE important. Let's make it more sensitive.
        # Stop after 50 rounds of no improvement instead of 100.
        early_stopping_rounds = 50

        # --- The rest of your fitting logic can use this `early_stopping_rounds` variable ---
        fit_base = dict(
            X=X_tr,
            y=y_tr,
            eval_set=[(X_val, y_val)],
            verbose=False,
        )
        fit_done = False
        # Attempt 1: callbacks API
        try:
            from xgboost.callback import EarlyStopping
            model.fit(**fit_base, callbacks=[EarlyStopping(rounds=early_stopping_rounds, save_best=True)])
            fit_done = True
        except (ImportError, TypeError):
             fit_done = False

        # Attempt 2: early_stopping_rounds kw (older API)
        if not fit_done:
            try:
                model.fit(**fit_base, early_stopping_rounds=early_stopping_rounds)
                fit_done = True
            except TypeError:
                fit_done = False
        # ... (rest of your fitting code) ...

        # Attempt 3: no early stopping
        if not fit_done:
            model.fit(**fit_base)

        # Use the best iteration found during early stopping when predicting
        # Predict using discovered best iteration if available across versions
        best_iter = getattr(model, "best_iteration_", getattr(model, "best_iteration", None))
        try:
            if best_iter is not None:
                y_pred = model.predict(X_test, iteration_range=(0, best_iter + 1))
            else:
                y_pred = model.predict(X_test)
        except TypeError:
            # Fallback for older xgboost versions
            best_ntree = getattr(model, "best_ntree_limit", None)
            if best_ntree is not None:
                y_pred = model.predict(X_test, ntree_limit=best_ntree)
            else:
                y_pred = model.predict(X_test)

        # --- METRICS (using centralized function) ---
        test_metrics = calculate_metrics(y_test[target], y_pred)
        results[target] = test_metrics
        models[target] = model

        best_iter = getattr(model, "best_iteration_", getattr(model, "best_iteration", None))
        print(f"✅ Test Set Performance for {target}:")
        if best_iter is not None:
            print(f"   Best iteration: {best_iter}")
        print(
            f"   RMSE={test_metrics['RMSE']:.3f}, R²={test_metrics['R2']:.3f}, RIA={test_metrics['RIA']:.3f}, MAE={test_metrics['MAE']:.3f}, Bias={test_metrics['Bias']:.3f}"
        )

    return models, results

# === PREDICT ON FUTURE/UNSEEN DATA ===
def predict(models, X_future):
    """Uses trained models to predict on future or unseen feature data."""
    
    def _predict_with_best(m, X):
        """Internal helper to predict using the best model iteration."""
        try:
            # Modern API (XGBoost > 1.6)
            if hasattr(m, "best_iteration") and m.best_iteration is not None:
                return m.predict(X, iteration_range=(0, m.best_iteration + 1))
        except TypeError:
            # Older API for iteration_range
            if hasattr(m, "best_ntree_limit"):
                return m.predict(X, ntree_limit=m.best_ntree_limit)
        # Fallback for any other case
        return m.predict(X)

    predictions = {}
    for target, model in models.items():
        preds = _predict_with_best(model, X_future)
        predictions[target] = preds
        print(f"🔮 Generated future predictions for {target}.")

    return predictions