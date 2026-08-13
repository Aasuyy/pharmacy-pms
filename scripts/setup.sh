#!/bin/bash
# Pharmacy Management System — Setup Script
# Run: bash scripts/setup.sh

set -e

echo "========================================"
echo "  PHARMACY PMS — Setup"
echo "========================================"

# Check Python version
PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Python version: $PYTHON_VERSION"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "→ Creating virtual environment..."
    python3 -m venv venv
fi

# Activate
source venv/bin/activate

# Upgrade pip
echo "→ Upgrading pip..."
pip install --upgrade pip

# Install Python dependencies
echo "→ Installing Python packages..."
pip install -r requirements.txt

# Initialize database
echo "→ Initializing database..."
mkdir -p data
sqlite3 data/pharmacy.db < database/migrations/001_initial_schema.sql

# Seed sample data
echo "→ Seeding sample data..."
sqlite3 data/pharmacy.db < database/seeds/001_sample_data.sql

# Create .env from example if not exists
if [ ! -f ".env" ]; then
    echo "→ Creating .env file..."
    cp .env.example .env
fi

# Build C++ engine
echo "→ Building C++ engine..."
mkdir -p build
g++ -std=c++17 -fopenmp -O3 -o build/pharmacy_engine src/backend/engine/pharmacy_engine.cpp 2>/dev/null || echo "  ⚠️  C++ build skipped (install g++ and libomp-dev)"

echo ""
echo "========================================"
echo "  ✓ Setup Complete!"
echo "========================================"
echo ""
echo "  Next steps:"
echo "    1. Terminal app:  python src/terminal/pharmacy_rich.py"
echo "    2. API server:    uvicorn src.backend.api.main:app --reload"
echo "    3. API docs:      http://localhost:8000/docs"
echo "    4. Docker:        docker-compose up -d"
echo ""
echo "  Default login: admin / admin123"
echo "========================================"
