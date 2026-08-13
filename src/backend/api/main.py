from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.backend.api.routers import drugs, patients, prescriptions, sales, dashboard, users
from src.backend.api.deps import ws_manager
from src.backend.api.routers import customers, shop, cart, orders, vendors
from src.backend.api.routers import seed

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Pharmacy API starting...")
    yield
    print("Pharmacy API shutting down...")

app = FastAPI(title="Pharmacy PMS API", version="3.0.0", lifespan=lifespan)

# CORS - allow ALL origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "pong", "data": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

app.include_router(users.router, prefix="/auth", tags=["Authentication"])
app.include_router(drugs.router, prefix="/drugs", tags=["Drugs"])
app.include_router(patients.router, prefix="/patients", tags=["Patients"])
app.include_router(prescriptions.router, prefix="/prescriptions", tags=["Prescriptions"])
app.include_router(sales.router, prefix="/sales", tags=["Sales"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(customers.router, prefix="/customer", tags=["Customer Auth"])
app.include_router(shop.router, prefix="/shop", tags=["Shop"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(vendors.router, prefix="/vendor", tags=["Vendor"])
app.include_router(seed.router, prefix="/seed", tags=["Seed"])

@app.get("/")
async def root():
    return {"message": "Pharmacy PMS API v3.0", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "ok"}
