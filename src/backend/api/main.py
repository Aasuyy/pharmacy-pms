from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.backend.api.routers.auth import router as auth_router

# Import analytics router if present
try:
    from src.backend.api.routers.analytics import router as analytics_router
except ImportError:
    analytics_router = None

app = FastAPI(title="Pharmacy PMS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Pharmacy API is running"}

app.include_router(auth_router, prefix="/auth", tags=["auth"])

if analytics_router:
    app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
