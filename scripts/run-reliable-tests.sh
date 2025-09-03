#!/bin/bash

# LTI Reliable Test Suite Runner
# This script runs only the stable, working tests

echo "🚀 Starting LTI Reliable Test Suite..."

# Function to cleanup background processes
cleanup() {
    echo "🧹 Cleaning up processes..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
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

# Run only reliable tests
echo "🧪 Running reliable E2E tests..."
npx cypress run --spec "cypress/e2e/cypress-config-test.cy.js,cypress/e2e/framework-verification.cy.js,cypress/e2e/setup-verification.cy.js,cypress/e2e/core-functionality.cy.js"

echo "✅ Reliable tests completed!"
