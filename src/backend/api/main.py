import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.backend.api.routers.drugs import router as drugs_router

app = FastAPI(
    title="Pharmacy Management System API",
    version="1.0.0",
)

raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
)
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(drugs_router, prefix="/api/v1/drugs", tags=["drugs"])

@app.get("/health")
def health_check():
    return {"status": "healthy"}
