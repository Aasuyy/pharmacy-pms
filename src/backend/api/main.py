from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.backend.api.deps import get_db, init_tables, seed_drugs
from src.backend.api.routers import customers, shop, cart, orders

@asynccontextmanager
async def lifespan(app: FastAPI):
    conn, db_type = get_db()
    try:
        init_tables(conn, db_type)
        seed_drugs(conn, db_type)
    finally:
        conn.close()
    yield

app = FastAPI(title="PharmaPro API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(customers.router, prefix="/customers", tags=["Customers"])
app.include_router(shop.router, prefix="/shop", tags=["Shop"])
app.include_router(cart.router, prefix="/cart", tags=["Cart"])
app.include_router(orders.router, prefix="/orders", tags=["Orders"])

@app.get("/")
async def root():
    return {"message": "PharmaPro API is running"}
