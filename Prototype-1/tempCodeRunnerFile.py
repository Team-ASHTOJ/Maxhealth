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
            n_estimators=2000,       # Reduced from 5000
            learning_rate=0.05,      # Increased from 0.03

            # Slightly shallower trees can be much faster
            max_depth=6,             # Optional: Reduce from 7 to 6 for more speed

            # --- These parameters are good, keep them ---
            min_child_weight=3,
            subsample=0.85,
            colsample_bytree=0.9,
            reg_lambda=1.2,
            objective="reg:squarederror",
            eval_metric="rmse",
            tree_method="hist",      # You are already using the fastest CPU method!
            random_state=42,
            n_jobs=-1,               # Use all available CPU cores
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