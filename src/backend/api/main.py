from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from src.backend.api.routers import drugs, patients, prescriptions, sales, dashboard, users
from src.backend.api.routers import customers, shop, cart, orders, vendors
from src.backend.api.routers import seed
from src.backend.api.deps import get_db, init_tables, seed_drugs

class WSManager:
    def __init__(self):
        self.connections = []
    async def connect(self, ws):
        self.connections.append(ws)
    def disconnect(self, ws):
        self.connections.remove(ws)
    async def broadcast(self, msg):
        for conn in self.connections:
            await conn.send_json(msg)

ws_manager = WSManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Pharmacy API starting...")
    conn, db_type = get_db()
    try:
        init_tables(conn, db_type)
        seed_drugs(conn, db_type)
    finally:
        conn.close()
    yield
    print("Pharmacy API shutting down...")

app = FastAPI(title="Pharmacy PMS API", version="3.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://pharmacy-pms-33ii.vercel.app", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(drugs.router, prefix="/drugs", tags=["Drugs"])
app.include_router(patients.router, prefix="/patients", tags=["Patients"])
app.include_router(prescriptions.router, prefix="/prescriptions", tags=["Prescriptions"])
app.include_router(sales.router, prefix="/sales", tags=["Sales"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(shop.router, prefix="/shop", tags=["Shop"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])
app.include_router(vendors.router, prefix="/vendors", tags=["Vendors"])
app.include_router(seed.router, prefix="/seed", tags=["Seed"])

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await ws_manager.broadcast({"type": "ping", "data": data})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.get("/")
async def root():
    return {"message": "PharmaPro API is running"}
