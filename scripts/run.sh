#!/bin/bash
# Quick run scripts for Pharmacy PMS

source venv/bin/activate

case "$1" in
    terminal|t)
        echo "Starting Terminal App (Rich UI)..."
        python src/terminal/pharmacy_rich.py
        ;;
    terminal-basic|tb)
        echo "Starting Terminal App (Basic)..."
        python src/terminal/pharmacy_basic.py
        ;;
    api|server|s)
        echo "Starting API Server..."
        uvicorn src.backend.api.main:app --reload --host 0.0.0.0 --port 8000
        ;;
    blockchain|bc)
        echo "Running Blockchain Demo..."
        python src/backend/blockchain/notary.py
        ;;
    engine|cpp)
        echo "Running C++ Engine..."
        ./build/pharmacy_engine
        ;;
    test)
        echo "Running tests..."
        pytest tests/ -v
        ;;
    docker)
        echo "Starting with Docker..."
        docker-compose up --build -d
        ;;
    *)
        echo "Usage: bash scripts/run.sh [command]"
        echo ""
        echo "Commands:"
        echo "  terminal, t       Run Rich Terminal UI"
        echo "  terminal-basic    Run Basic Terminal UI"
        echo "  api, server, s    Run FastAPI server"
        echo "  blockchain, bc    Run Blockchain demo"
        echo "  engine, cpp       Run C++ engine"
        echo "  test              Run test suite"
        echo "  docker            Start with Docker Compose"
        ;;
esac
