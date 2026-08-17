from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.backend.api.routers.auth import router as auth_router
from src.backend.api.routers.orders import router as orders_router
from src.backend.api.routers.users import router as users_router
from src.backend.api.routers.analytics import router as analytics_router
from src.backend.api.routers.drugs import router as drugs_router

app = FastAPI(title="Pharmacy PMS API", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://pharmacy-pms.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {"status": "ok", "message": "Pharmacy API is running"}

app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(orders_router, prefix="/orders", tags=["orders"])
app.include_router(users_router, prefix="/users", tags=["users"])
app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])
app.include_router(drugs_router, prefix="/drugs", tags=["drugs"])
