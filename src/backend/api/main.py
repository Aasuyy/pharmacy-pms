from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.backend.api.router import api_router  # Adjust if auth router is separate

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

# Include router directly
app.include_router(api_router)

# If auth routes are in a separate module without an '/auth' prefix, mount them explicitly:
# from src.backend.api.routes.auth import router as auth_router
# app.include_router(auth_router, prefix="/auth", tags=["auth"])
