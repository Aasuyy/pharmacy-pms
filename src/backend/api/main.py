from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.backend.api.router import api_router  # Adjust router import path if needed

app = FastAPI(title="Pharmacy PMS API")

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows local dev (localhost:8000) and production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint for health checks
@app.get("/")
def read_root():
    return {"status": "ok", "message": "Pharmacy API is running"}

# Include all API routes (auth, admin, inventory, etc.)
app.include_router(api_router)
