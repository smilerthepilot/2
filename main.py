
from fastapi import FastAPI
from fastapi.responses import FileResponse
from pathlib import Path

app = FastAPI()

@app.get("/")
def root():
    return FileResponse(Path(__file__).parent / "index.html")
