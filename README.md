# Delhi Air Quality Forecasting Platform

This project provides a complete pipeline for forecasting air quality (O₃ and NO₂) across multiple sites in Delhi using machine learning (XGBoost). It includes data parsing, model training, prediction, evaluation, and an interactive dashboard for visualization and analysis.

## Features
- **Data Parsing:** Reads and preprocesses site-specific air quality and meteorological data.
- **Model Training:** Trains XGBoost regression models for O₃ and NO₂ using robust hyperparameters and early stopping.
- **Prediction & Evaluation:** Generates predictions for unseen data and computes multiple regression metrics (RMSE, MAE, Bias, R², RIA).
- **Metrics Storage:** Saves per-site, per-pollutant metrics as JSON for dashboard use.
- **Interactive Dashboard:** Visualizes predictions, true values, and accuracy scores for each site and pollutant using Streamlit.

## Folder Structure
```
Prototype-1/
├── DataParse.py                # Data loading and preprocessing
├── data_modeling.py            # Model training, prediction, and metrics
├── main.py                     # Pipeline runner for all sites
├── dashboard.py                # Streamlit dashboard for visualization
├── requirements.txt            # Python dependencies
├── predictions_site_{n}.csv    # Model predictions for each site (generated)
├── metrics_site_{n}.json       # Model metrics for each site (generated)
├── Data_SIH_2025/              # Raw data folder
│   ├── site_{n}_train_data.csv
│   └── site_{n}_unseen_input_data.csv
└── ...
```

## How to Run

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Prepare Data
- Place all raw CSVs in the `Data_SIH_2025/` folder as provided.

### 3. Train Models & Generate Predictions
```bash
python main.py
```
- This will train models for all sites, generate `predictions_site_{n}.csv` and `metrics_site_{n}.json` files.

### 4. Launch the Dashboard
```bash
streamlit run dashboard.py
```
- Use the sidebar to select site, pollutant, and forecast horizon.
- View accuracy scores, metric breakdowns, time series, and heatmaps.

## Key Files
- **DataParse.py:** Loads and preprocesses data for each site.
- **data_modeling.py:** Trains XGBoost models, computes metrics, and handles robust early stopping.
- **main.py:** Runs the full pipeline for all sites, saving predictions and metrics.
- **dashboard.py:** Streamlit app for interactive exploration and model evaluation.
- **requirements.txt:** Lists all required Python packages.

## Metrics
- **RMSE, MAE, Bias, R², RIA** are computed for each site and pollutant.
- A combined accuracy score is shown in the dashboard, normalized for interpretability.

## Customization & Tuning
- Hyperparameters for XGBoost are set for strong generalization but can be tuned in `data_modeling.py`.
- The dashboard automatically discovers available metrics and predictions.

## Troubleshooting
- If you see missing file errors, ensure you have run `main.py` and that all required CSVs are present in `Data_SIH_2025/`.
- For best results, use the latest versions of XGBoost, pandas, and scikit-learn.

## License
This project is for research and educational use. Please cite appropriately if used in publications.
