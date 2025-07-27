
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import json
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONFIG_FILE = Path(__file__).parent / "config.json"
FRONTEND_FILE = Path(__file__).parent / "index.html"

@app.get("/config")
def get_config():
    with open(CONFIG_FILE, "r") as f:
        return json.load(f)

@app.get("/")
def read_root():
    return FileResponse(FRONTEND_FILE)
