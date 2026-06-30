# Jini AI Backend

Minimal FastAPI backend for the Jini AI WebSocket assistant.

Quick start

1. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate  # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

2. Run with uvicorn (from the `backend/` folder):

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

WebSocket endpoint: `ws://127.0.0.1:8000/ws`

HTTP health: `http://127.0.0.1:8000/` -> { "status": "Jini AI running" }
