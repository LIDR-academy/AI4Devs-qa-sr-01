#!/bin/bash

# Script to run E2E tests with proper server setup
set -e

echo "🚀 Starting E2E Test Environment..."

# Function to cleanup processes on exit
cleanup() {
    echo "🧹 Cleaning up processes..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    exit
}

# Set trap to cleanup on script exit
trap cleanup EXIT INT TERM

# Start backend server
echo "📡 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend server..."
while ! curl -s http://localhost:3010/health > /dev/null 2>&1; do
    sleep 1
done
echo "✅ Backend server is ready"

# Start frontend server
echo "🎨 Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Wait for frontend to be ready
echo "⏳ Waiting for frontend server..."
while ! curl -s http://localhost:3000 > /dev/null 2>&1; do
    sleep 1
done
echo "✅ Frontend server is ready"

# Run Cypress tests
echo "🧪 Running E2E tests..."
npx cypress run

echo "✅ E2E tests completed!"
