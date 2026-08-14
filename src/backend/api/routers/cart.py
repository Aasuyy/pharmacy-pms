from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_cart():
    return {"items": [], "total": 0}

@router.post("/add")
async def add_to_cart():
    return {"message": "Cart is client-side only"}

@router.put("/update-drug/{medicine_id}")
async def update_cart(medicine_id: str):
    return {"message": "Cart is client-side only"}

@router.delete("/remove-drug/{medicine_id}")
async def remove_from_cart(medicine_id: str):
    return {"message": "Cart is client-side only"}

@router.delete("/clear")
async def clear_cart():
    return {"message": "Cart is client-side only"}
