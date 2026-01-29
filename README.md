# Air Quality Forecasting and Analysis

This project provides a full-stack solution for forecasting and analyzing air quality data. It includes a Python backend for data processing and modeling, and a React frontend for data visualization and user interaction.

## Features

- **Air Quality Forecasting:** Predicts future air quality levels for various pollutants.
- **Data Visualization:** Interactive charts and heatmaps to visualize historical and forecasted data.
- **Health Recommendations:** Provides personalized health advice based on AQI levels.
- **Crowdsourced Feedback:** Allows users to submit feedback on current air quality conditions.
- **Model Performance Metrics:** Displays metrics to evaluate the accuracy of the forecasting models.

## Technologies Used

### Backend

- **Python:** The core language for data processing and modeling.
- **FastAPI:** A modern, fast (high-performance) web framework for building APIs.
- **Pandas & NumPy:** For data manipulation and numerical operations.
- **Scikit-learn & XGBoost:** For building and training machine learning models.
- **Uvicorn:** An ASGI server for running the FastAPI application.

### Frontend

- **React:** A JavaScript library for building user interfaces.
- **Vite:** A fast build tool and development server for modern web projects.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Recharts:** A composable charting library built on React components.
- **i18next:** An internationalization framework for translating the application.

## Setup and Installation

### Prerequisites

- Python 3.10 or higher
- Node.js and npm

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**
    ```bash
    python3 -m venv .venv
    ```

3.  **Activate the virtual environment:**
    - On macOS and Linux:
      ```bash
      source .venv/bin/activate
      ```
    - On Windows:
      ```bash
      .venv\\Scripts\\activate
      ```

4.  **Install the required Python packages:**
    ```bash
    pip install -r requirements.txt
    ```

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install the required npm packages:**
    ```bash
    npm install
    ```

## Running the Application

### Backend

1.  **Navigate to the `backend` directory and ensure your virtual environment is activated.**

2.  **Run the data processing pipeline to generate predictions:**
    ```bash
    python main.py
    ```

3.  **Start the FastAPI server:**
    ```bash
    uvicorn app:app --host 0.0.0.0 --port 8000 --reload
    ```

### Frontend

1.  **Navigate to the `frontend` directory.**

2.  **Start the Vite development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173`.
