"""
API Router — Dashboard & Analytics
"""

from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from src.backend.core.database import db
from src.backend.core.models import DashboardStats
from src.backend.api.deps import get_current_user, DB_PATH, UserOut

router = APIRouter()

@router.get("/stats", response_model=DashboardStats)
async def get_stats(current_user: dict = Depends(get_current_user)):
    with db.transaction() as conn:
        cursor = conn.execute("SELECT COUNT(*) as count FROM drugs")
        total_drugs = cursor.fetchone()["count"]

        cursor = conn.execute("SELECT COUNT(*) as count FROM drugs WHERE stock_quantity <= reorder_level")
        low_stock = cursor.fetchone()["count"]

        cutoff = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
        cursor = conn.execute("SELECT COUNT(*) as count FROM drugs WHERE expiry_date <= ?", (cutoff,))
        expiring = cursor.fetchone()["count"]

        today = datetime.now().strftime("%Y-%m-%d")
        cursor = conn.execute("SELECT COALESCE(SUM(total_amount), 0) as total FROM sales WHERE date(created_at) = ?", (today,))
        revenue = cursor.fetchone()["total"]

        cursor = conn.execute("SELECT COUNT(*) as count FROM prescriptions WHERE status = 'pending'")
        pending = cursor.fetchone()["count"]

        cursor = conn.execute("SELECT COUNT(*) as count FROM patients")
        total_patients = cursor.fetchone()["count"]

        cursor = conn.execute("SELECT COUNT(*) as count FROM sales WHERE date(created_at) = ?", (today,))
        today_sales = cursor.fetchone()["count"]

    return DashboardStats(
        total_drugs=total_drugs,
        low_stock_count=low_stock,
        expiring_count=expiring,
        today_revenue=revenue,
        pending_prescriptions=pending,
        total_patients=total_patients,
        today_sales_count=today_sales
    )
