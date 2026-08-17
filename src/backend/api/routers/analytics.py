from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_analytics_overview():
    return {
        "metrics": {
            "total_revenue": 108400,
            "total_orders": 387,
            "avg_order_value": 280,
            "active_customers": 124
        },
        "dailySales": [
            {"date": "2026-08-07", "label": "Sun", "revenue": 12400, "orders": 45},
            {"date": "2026-08-08", "label": "Mon", "revenue": 9800, "orders": 38},
            {"date": "2026-08-09", "label": "Tue", "revenue": 15200, "orders": 52},
            {"date": "2026-08-10", "label": "Wed", "revenue": 11300, "orders": 41},
            {"date": "2026-08-11", "label": "Thu", "revenue": 18700, "orders": 63},
            {"date": "2026-08-12", "label": "Fri", "revenue": 22100, "orders": 74},
            {"date": "2026-08-13", "label": "Sat", "revenue": 19500, "orders": 68}
        ],
        "topItems": [
            {"name": "Paracetamol 500mg", "sold": 340, "revenue": 1020, "profit": 340},
            {"name": "Amoxicillin 500mg", "sold": 180, "revenue": 2700, "profit": 900},
            {"name": "Vitamin C 1000mg", "sold": 120, "revenue": 4200, "profit": 1680},
            {"name": "ORS Powder", "sold": 450, "revenue": 2250, "profit": 450},
            {"name": "Cetirizine 10mg", "sold": 95, "revenue": 760, "profit": 285}
        ],
        "staffMetrics": [
            {"name": "Ramesh Sharma", "rxFilled": 145, "sales": 45200, "accuracy": 98},
            {"name": "Sita Devi", "rxFilled": 112, "sales": 31800, "accuracy": 96},
            {"name": "Hari Prasad", "rxFilled": 89, "sales": 24100, "accuracy": 94}
        ]
    }
