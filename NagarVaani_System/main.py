"""
main.py — NagarVaani FastAPI Application
"""

from dotenv import load_dotenv
load_dotenv()  # Load .env BEFORE any other imports that use os.getenv()

import intent
from fastapi import FastAPI
from webhook  import router as webhook_router
from database import init_db

app = FastAPI(title="NagarVaani", version="1.0")

@app.on_event("startup")
async def startup():
    init_db()
    intent._load()
    print("[NagarVaani] System started & AI loaded")

app.include_router(webhook_router, prefix="/webhook")

@app.get("/")
def root():
    return {
        "project": "NagarVaani — नगरवाणी",
        "tagline": "Every Citizen Heard. Every Vote Counted.",
        "status":  "running",
        "team":    "Code-Scavengers · IIITN"
    }

@app.get("/health")
def health():
    return {"status": "ok"}
