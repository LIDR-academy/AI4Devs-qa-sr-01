# AI4Devs QA - Frontend Application

A modern React application for managing recruitment processes, built with TypeScript and comprehensive E2E testing using Cypress.

## 🚀 Features

- **Position Management**: Create, view, and manage job positions
- **Candidate Tracking**: Track candidates through interview stages
- **Drag & Drop Interface**: Intuitive candidate movement between process stages
- **Real-time Updates**: Live updates of candidate status and progress
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, React Bootstrap
- **State Management**: React Hooks
- **Drag & Drop**: React Beautiful DnD
- **Testing**: Cypress E2E, Jest
- **Build Tool**: Create React App
- **Styling**: Bootstrap 5, React Bootstrap Icons

## 📋 Prerequisites

- Node.js 18+ 
- npm 9+
- Backend API running on port 3010

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 3. Start Backend (Required)

Make sure the backend API is running on port 3010. See the backend README for setup instructions.

## 🧪 Testing

### Unit Tests

```bash
npm test
```

### E2E Tests with Cypress

#### Interactive Mode
```bash
npm run e2e:open
```

#### Headless Mode
```bash
npm run e2e
```

#### Specific Test Suites
```bash
# Run smoke tests
npm run e2e:smoke

# Run position tests
npm run e2e:positions

# Run comprehensive position spec
npm run e2e:position-spec
```

#### CI/CD Testing
```bash
# Run tests in CI environment
npm run test:ci

# Run all tests (unit + e2e)
npm run test:all
```

### Docker Testing

```bash
# Run tests in Docker containers
npm run test:docker
```

## 🏗️ Build & Deployment

### Production Build

```bash
npm run build
```

### Docker Build

```bash
# Build frontend image
docker build -t ai4devs-frontend .

# Run with docker-compose
docker-compose up
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── AddCandidateForm.js
│   │   ├── CandidateCard.js
│   │   ├── CandidateDetails.js
│   │   ├── FileUploader.js
│   │   ├── PositionDetails.js
│   │   ├── Positions.tsx
│   │   ├── RecruiterDashboard.js
│   │   └── StageColumn.js
│   ├── services/           # API services
│   │   └── candidateService.js
│   └── assets/             # Static assets
├── cypress/                # E2E tests
│   ├── e2e/               # Test specifications
│   ├── fixtures/          # Test data
│   ├── support/           # Test helpers and configuration
│   │   └── helpers/       # Modular test helpers
│   └── screenshots/       # Test screenshots
├── public/                # Public assets
└── scripts/               # Build and test scripts
```

## 🧪 E2E Testing Architecture

### Test Organization

The E2E tests are organized into modular helpers for better maintainability:

- **`api-helpers.js`**: API mocking and validation
- **`navigation-helpers.js`**: Page navigation utilities
- **`drag-drop-helpers.js`**: Drag & drop functionality testing
- **`validation-helpers.js`**: Element verification and structure validation
- **`test-setup-helpers.js`**: Complete test configuration

### Test Coverage

- ✅ **38 E2E tests** covering all major functionality
- ✅ **Position Management**: Page load, navigation, content validation
- ✅ **Candidate Tracking**: Column validation, drag & drop simulation
- ✅ **API Integration**: Request/response validation, error handling
- ✅ **Cross-browser Testing**: Chrome, Firefox support

### Running Specific Tests

```bash
# Run only position page tests
npm run e2e:position-spec

# Run only smoke tests
npm run e2e:smoke

# Run with specific browser
npx cypress run --browser firefox
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:3010
REACT_APP_ENVIRONMENT=development
```

### Cypress Configuration

The Cypress configuration is in `cypress.config.ts` and includes:

- Base URL configuration
- Viewport settings
- Timeout configurations
- Browser settings

## 🚀 CI/CD Pipeline

### GitHub Actions

The project includes automated CI/CD with GitHub Actions:

- **Triggered on**: Push to main/develop, Pull Requests
- **Browsers**: Chrome, Firefox
- **Artifacts**: Screenshots and videos on test failure
- **Parallel Execution**: Multiple browser testing

### Docker Support

- **Development**: `docker-compose.yml`
- **Testing**: `docker-compose.test.yml`
- **Production**: Multi-stage Dockerfile

## 📊 Test Reports

Test results and artifacts are automatically generated:

- **Screenshots**: Available in `cypress/screenshots/`
- **Videos**: Available in `cypress/videos/`
- **CI Artifacts**: Uploaded to GitHub Actions on failure

## 🐛 Troubleshooting

### Common Issues

1. **Backend Connection Error**
   - Ensure backend is running on port 3010
   - Check API_URL environment variable

2. **Cypress Tests Failing**
   - Verify frontend is running on port 3000
   - Check browser compatibility
   - Review test data in fixtures

3. **Build Issues**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

### Debug Mode

```bash
# Run Cypress in debug mode
npx cypress open --config video=false

# Run with specific test
npx cypress run --spec "cypress/e2e/position.spec.js"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Code Quality

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](../LICENSE.md) file for details.

## 🆘 Support

For support and questions:

- Check the [Issues](../../issues) page
- Review the [Documentation](../docs)
- Contact the development team

---

**Built with ❤️ by the AI4Devs Team**