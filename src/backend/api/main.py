from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.backend.api.router import api_router
from src.backend.api.routers.auth import router as auth_router

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

# Include base API routes
app.include_router(api_router)

# Mount auth routes under /auth prefix to match /auth/admin/login
app.include_router(auth_router, prefix="/auth", tags=["auth"])
