# Cypress E2E Testing Setup Guide

This guide explains how to set up and run end-to-end tests for the LTI Position interface using Cypress.

## 🏗️ Environment Architecture

### Database Layer
- **PostgreSQL Database**: Running in Docker container `ai4devs-qa-sr-01-db-1`
- **Port**: 5432 (mapped from Docker)
- **Credentials**: Configured via `.env` file
- **Test Data**: Populated via Prisma seed script

### Application Layer
- **Backend API**: Express.js with TypeScript on `localhost:3010`
- **Frontend**: React SPA on `localhost:3000`
- **Database ORM**: Prisma for migrations and data access

### Testing Layer
- **Cypress**: E2E testing framework (v15.0.0)
- **Test Database**: Uses same PostgreSQL instance with seed data
- **Custom Commands**: Navigation, API interception, drag-and-drop utilities

## 🚀 Quick Start

### 1. Start Database (Docker)
```bash
# Start PostgreSQL container
docker-compose up -d db

# Verify container is running
docker ps
# Should show: ai4devs-qa-sr-01-db-1 running on port 5432
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies (if not done)
npm install

# Run database migrations
npx prisma migrate dev

# Seed test data
npx prisma db seed

# Start backend server
npm run dev
# Backend runs on http://localhost:3010
```

### 3. Setup Frontend
```bash
cd frontend

# Install dependencies (if not done)
npm install

# Start frontend server
npm start
# Frontend runs on http://localhost:3000
```

### 4. Run Tests

#### Option A: Automated Script (Recommended)
```bash
# From project root - starts all services and runs tests
./scripts/run-e2e-tests.sh
```

#### Option B: Manual Execution
```bash
# Interactive mode (for development)
# run from the root of the project
npx cypress open

# Headless mode (for CI/CD)
npx cypress run

# Run specific test file
npx cypress run --spec cypress/e2e/position-page-load.cy.js
```

## 📁 Test Structure

```
cypress/
├── e2e/                          # Test files
│   ├── framework-verification.cy.js    # Cypress setup verification
│   └── position-page-load.cy.js        # Position interface tests (8 tests)
├── fixtures/                    # Test data
│   ├── test-data.json          # Basic test fixtures
│   └── test-position-data.json # Position-specific test data
├── support/                     # Configuration & utilities
│   ├── commands.js             # Custom Cypress commands
│   ├── database.js             # Database utilities (disabled)
│   └── e2e.js                  # Global configuration
└── README.md                   # This file
```

## 🧪 Current Test Coverage

### ✅ Phase 2 Complete (8/8 tests passing)
- **Position Title Display**: Verifies correct position name loading
- **Interview Stage Columns**: Tests all 3 interview stages render correctly
- **Candidate Cards Placement**: Validates candidates appear in correct columns
- **Loading States**: Tests API response handling
- **Empty Columns**: Handles stages with no candidates

### 🔄 Phase 3 In Progress
- **Drag-and-Drop Testing**: Moving candidates between interview stages
- **API Validation**: PUT requests to update candidate status

## 🔧 Configuration Details

### Cypress Configuration (`cypress.config.js`)
- **Base URL**: `http://localhost:3000`
- **Viewport**: 1280x720
- **Timeouts**: 10s default, 30s page load
- **Environment Variables**: API_URL for backend communication

### Custom Commands (`cypress/support/commands.js`)
- `cy.visitPosition(id)`: Navigate to position page
- `cy.waitForPageLoad()`: Wait for complete page loading
- `cy.setupApiInterception()`: Mock/intercept API calls
- `cy.dragAndDrop()`: Custom drag-and-drop for react-beautiful-dnd

## 🐛 Troubleshooting

### Database Issues
```bash
# Check if Docker container is running
docker ps

# Restart database if needed
docker-compose restart db

# Reset database with fresh seed data
cd backend
npx prisma migrate reset --force
npx prisma db seed
```

### API Connection Issues
```bash
# Verify backend is running and responding
curl http://localhost:3010/positions/1/interviewFlow

# Check frontend is accessible
curl http://localhost:3000
```

### Test Failures
```bash
# Run tests with debug output
DEBUG=cypress:* npx cypress run

# Check screenshots for visual failures
ls cypress/screenshots/

# Verify test data exists
cd backend
npx prisma studio  # Opens database browser
```

## 📊 Test Data

The tests use real backend data populated by the Prisma seed script:
- **Position**: "Senior Full-Stack Engineer" (ID: 1)
- **Interview Stages**: Initial Screening, Technical Interview, Manager Interview
- **Candidates**: John Doe, Jane Smith, Carlos García with different stages and ratings

## 🎯 Next Steps

1. **Phase 3**: Implement drag-and-drop functionality tests
2. **Phase 4**: Add error handling and edge case testing
3. **CI/CD Integration**: Automated test execution in pipeline
