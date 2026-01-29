# Backend - Air Quality Forecast API

This folder contains the FastAPI backend for the Air Quality Forecast project.

Quick start (macOS / zsh):

1. Create and activate a virtual environment (one-time):

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

2. Run the server (inside the activated venv):

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

If you close and reopen the terminal, re-activate the venv before running uvicorn:

```bash
source .venv/bin/activate
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Troubleshooting
---------------
- ModuleNotFoundError: No module named 'fastapi' — make sure your venv is activated (see above). If you installed packages in a different venv, either activate that one or reinstall into `.venv`.
- If creating `.venv` inside this project caused build errors on macOS with Python 3.13, use a separate venv path with Python 3.12 and install with `--prefer-binary`.

