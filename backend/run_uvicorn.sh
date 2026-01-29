#!/usr/bin/env bash
# Activate the project's virtualenv and run uvicorn
set -euo pipefail
if [ -f .venv/bin/activate ]; then
  # shellcheck disable=SC1091
  source .venv/bin/activate
  uvicorn app:app --reload --host 0.0.0.0 --port 8000
else
  echo "No .venv found. Create one with: python3.12 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi
