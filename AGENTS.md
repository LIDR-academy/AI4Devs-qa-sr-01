# AGENTS.md

## Project Overview

**LTI (Talent Tracking System)** - Full-stack application for managing candidates with Domain-Driven Design (DDD) architecture.

- **Backend**: Express + TypeScript + Prisma + PostgreSQL (DDD Architecture)
- **Frontend**: React + TypeScript + Bootstrap + React Router
- **Database**: PostgreSQL with Docker
- **Architecture**: Clean Architecture with DDD principles

## Core Principles & Philosophy

### SOLID Principles (Mandatory)
- **S - Single Responsibility**: Each class/function has one reason to change
- **O - Open/Closed**: Open for extension, closed for modification
- **L - Liskov Substitution**: Derived classes must be substitutable for base classes
- **I - Interface Segregation**: No client should depend on methods it doesn't use
- **D - Dependency Inversion**: Depend on abstractions, not concretions

### KISS (Keep It Simple, Stupid)
- Prefer simple, readable solutions over clever code
- Avoid premature optimization
- Choose clarity over brevity when in conflict

### DRY (Don't Repeat Yourself)
- Extract common logic into reusable functions/classes
- Use composition over inheritance when possible
- Create utility functions for repeated operations

### Design Patterns Guidelines
- **ONLY use patterns when they add clear value**
- **AVOID patterns that introduce unnecessary complexity**
- **Preferred patterns**: Repository, Factory, Strategy, Observer (for domain events)
- **Avoid**: Overuse of Singleton, complex inheritance hierarchies

## Setup Commands

### Initial Setup
```bash
# Install root dependencies
npm install

# Setup backend
cd backend && npm install

# Setup frontend  
cd frontend && npm install

# Start PostgreSQL database
docker-compose up -d

# Setup database schema
cd backend
npx prisma generate
npx prisma migrate dev
ts-node seed.ts
```

### Development Workflow
```bash
# Start backend (port 3010)
cd backend && npm run dev

# Start frontend (port 3000)
cd frontend && npm start

# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test

# Lint backend code
cd backend && npx eslint src/ --fix

# Format code
cd backend && npx prettier --write src/
```

### Production Build
```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build

# Start production
cd backend && npm run start:prod
```

## Architecture Guidelines

### Domain-Driven Design (DDD) Structure

```
backend/src/
├── domain/          # Business logic & entities (CORE)
│   ├── models/      # Domain entities (Candidate, Education, etc.)
│   ├── services/    # Domain services (complex business logic)
│   └── repositories/ # Repository interfaces
├── application/     # Use cases & application services
│   └── services/    # Application services (orchestration)
├── infrastructure/ # External concerns (database, file system)
│   └── repositories/ # Repository implementations
├── presentation/   # Controllers & API layer
│   └── controllers/
└── routes/         # API routes definition
```

### DDD Implementation Rules

#### Entities
- **Must have unique identity** (ID)
- **Encapsulate business logic** within the entity
- **Validate invariants** in constructors/methods
- **Example**: 
```typescript
export class Candidate {
    constructor(data: CandidateData) {
        this.validateEmail(data.email);
        // ... initialization
    }
    
    private validateEmail(email: string): void {
        if (!email.includes('@')) {
            throw new Error('Invalid email format');
        }
    }
}
```

#### Value Objects
- **Immutable objects** without identity
- **Represent domain concepts** (Email, PhoneNumber, Address)
- **Self-validating**

#### Repositories
- **Interfaces in domain layer**
- **Implementations in infrastructure layer**
- **Use dependency injection**

#### Services
- **Domain Services**: Complex business logic that doesn't belong to entities
- **Application Services**: Orchestrate use cases, coordinate between entities

## Code Style & Conventions

### TypeScript Guidelines
- **Strict mode enabled** - No implicit any, strict null checks
- **Explicit types** for public APIs, function parameters, and return values
- **Use interfaces** for object shapes, **classes** for behavior
- **Prefer composition** over inheritance

### Naming Conventions
- **PascalCase**: Classes, Interfaces, Types (`Candidate`, `ICandidateRepository`)
- **camelCase**: Variables, functions, methods (`candidateService`, `validateEmail`)
- **kebab-case**: File names, API routes (`candidate-controller.ts`, `/api/candidates`)
- **SCREAMING_SNAKE_CASE**: Constants (`MAX_FILE_SIZE`, `API_BASE_URL`)

### Code Formatting (Prettier + ESLint)
```json
{
    "singleQuote": true,
    "trailingComma": "all",
    "semi": false,
    "tabWidth": 2,
    "printWidth": 80
}
```

### Function/Method Guidelines
- **Pure functions** when possible (no side effects)
- **Single responsibility** - functions should do one thing well
- **Meaningful names** - function name should describe what it does
- **Max 20 lines** per function (extract if longer)
- **Max 4 parameters** (use objects for more)

## Testing Strategy

### Testing Pyramid
1. **Unit Tests** (70%) - Domain logic, business rules
2. **Integration Tests** (20%) - API endpoints, database operations  
3. **E2E Tests** (10%) - Critical user journeys

### Unit Testing Guidelines

#### Backend Unit Tests
```bash
# Run all tests
cd backend && npm test

# Run tests in watch mode
cd backend && npm test -- --watch

# Run specific test file
cd backend && npm test -- candidate.test.ts

# Run tests with coverage
cd backend && npm test -- --coverage
```

#### Test Structure (AAA Pattern)
```typescript
describe('Candidate', () => {
    describe('validateEmail', () => {
        it('should throw error for invalid email', () => {
            // Arrange
            const invalidEmail = 'invalid-email';
            
            // Act & Assert
            expect(() => {
                new Candidate({ email: invalidEmail, ...validData });
            }).toThrow('Invalid email format');
        });
    });
});
```

#### Testing Best Practices
- **Test behavior, not implementation**
- **One assertion per test** (when possible)
- **Descriptive test names** - `should_throw_error_when_email_is_invalid`
- **Mock external dependencies** (database, API calls)
- **Use test factories** for creating test data
- **Test edge cases** and error conditions

#### Frontend Testing (React)
```bash
# Run React tests
cd frontend && npm test

# Run with coverage
cd frontend && npm test -- --coverage --watchAll=false
```

### Integration Testing
- **Test API endpoints** with real database (test database)
- **Test repository implementations** 
- **Test service layer** with mocked infrastructure
- **Use beforeEach/afterEach** for database cleanup

### E2E Testing with BDD (Cypress + Cucumber + Gherkin)

Our E2E testing strategy implements **Behavior-Driven Development (BDD)** using Cypress with Cucumber integration, enabling collaboration between Development, QA, and Stakeholders through shared, human-readable specifications.

#### Installation & Setup
```bash
# Install Cypress and Cucumber preprocessor
cd frontend && npm install --save-dev cypress @badeball/cypress-cucumber-preprocessor

# Install TypeScript support (if needed)
npm install --save-dev typescript

# Create Cypress configuration
npx cypress open  # Initial setup
```

#### Configuration Files

**cypress.config.ts**
```typescript
import { defineConfig } from 'cypress'
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor'
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild'
import createBundler from '@bahmutov/cypress-esbuild-preprocessor'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.feature',
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config)
      
      on('file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      )
      
      return config
    },
  },
})
```

**package.json scripts**
```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "cypress:run:headed": "cypress run --headed",
    "e2e:dev": "start-server-and-test dev 3000 cypress:open",
    "e2e:ci": "start-server-and-test start 3000 cypress:run"
  }
}
```

#### Directory Structure
```
frontend/                            # ⚠️ Todo va dentro del directorio frontend
├── cypress/
│   ├── e2e/
│   │   ├── features/                # Feature files (.feature)
│   │   │   ├── candidate-management.feature
│   │   │   ├── user-authentication.feature
│   │   │   └── search-functionality.feature
│   │   ├── step-definitions/        # Step implementations (.ts)
│   │   │   ├── candidate-steps.ts
│   │   │   ├── common-steps.ts
│   │   │   └── auth-steps.ts
│   │   └── support/                 # Support files
│   │       ├── page-objects/        # Page Object Model
│   │       ├── commands.ts          # Custom commands
│   │       └── e2e.ts               # Global config
│   ├── fixtures/                    # Test data
│   └── downloads/                   # Downloaded files
├── cypress.config.ts                # Cypress configuration
├── src/                             # React application code
├── package.json                     # Dependencies including Cypress + Cucumber
└── tsconfig.json                    # TypeScript config
```

#### BDD Testing Approach

**Feature Files (Gherkin Syntax)**
```gherkin
# cypress/e2e/features/candidate-management.feature
Feature: Candidate Management
  As a recruiter
  I want to manage candidate information
  So that I can track potential hires effectively

  Background:
    Given I am logged in as a recruiter
    And I am on the candidates page

  Scenario: Create a new candidate
    When I click on "Add New Candidate" button
    And I fill in the candidate form with:
      | field       | value                    |
      | firstName   | John                     |
      | lastName    | Doe                      |
      | email       | john.doe@example.com     |
      | phone       | +1-555-0123             |
    And I click "Save Candidate"
    Then I should see "Candidate created successfully"
    And the candidate should appear in the candidates list

  Scenario: Search candidates by email
    Given there are existing candidates in the system
    When I search for "john.doe@example.com"
    Then I should see only candidates matching that email
    And the results should be highlighted

  Scenario: Upload candidate CV
    Given I am viewing a candidate profile
    When I upload a CV file "sample-cv.pdf"
    Then the CV should be attached to the candidate
    And I should see a download link for the CV

  Scenario Outline: Validate candidate form fields
    When I try to create a candidate with "<field>" as "<value>"
    Then I should see validation error "<error_message>"

    Examples:
      | field     | value           | error_message        |
      | email     | invalid-email   | Invalid email format |
      | phone     | 123             | Invalid phone number |
      | firstName | ""              | First name required  |
```

**Step Definitions (TypeScript)**
```typescript
// frontend/cypress/e2e/step-definitions/candidate-steps.ts
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor'
import { CandidatesPage } from '../support/page-objects/CandidatesPage'
import { CandidateFormPage } from '../support/page-objects/CandidateFormPage'

const candidatesPage = new CandidatesPage()
const candidateForm = new CandidateFormPage()

Given('I am on the candidates page', () => {
  candidatesPage.visit()
})

When('I click on {string} button', (buttonText: string) => {
  candidatesPage.clickButton(buttonText)
})

When('I fill in the candidate form with:', (dataTable) => {
  const data = dataTable.rowsHash()
  candidateForm.fillForm(data)
})

Then('I should see {string}', (message: string) => {
  cy.contains(message).should('be.visible')
})

Then('the candidate should appear in the candidates list', () => {
  candidatesPage.shouldShowNewCandidate()
})
```

**Page Object Model**
```typescript
// frontend/cypress/e2e/support/page-objects/CandidatesPage.ts
export class CandidatesPage {
  visit() {
    cy.visit('/candidates')
  }

  clickButton(buttonText: string) {
    cy.contains('button', buttonText).click()
  }

  searchCandidate(email: string) {
    cy.get('[data-testid="search-input"]').type(email)
    cy.get('[data-testid="search-button"]').click()
  }

  shouldShowNewCandidate() {
    cy.get('[data-testid="candidates-list"]')
      .should('contain', 'John Doe')
  }
}
```

#### BDD Test Guidelines

**Writing Feature Files**
- **User-centric language**: Write from user's perspective
- **Business value focused**: Each scenario should represent business value
- **Readable by stakeholders**: Non-technical team members should understand
- **Avoid technical implementation details**: Focus on what, not how

**Gherkin Best Practices**
- **Given**: Setup the initial state
- **When**: Describe the action
- **Then**: Assert the expected outcome
- **Background**: Common setup for all scenarios
- **Scenario Outline**: Data-driven testing

**Step Definition Principles**
- **Reusable steps**: Write generic, reusable step definitions
- **Page Object Model**: Separate UI interactions from test logic
- **Data-driven**: Use parameters and data tables
- **Meaningful assertions**: Clear, specific expectations

#### Running E2E Tests

**Development Environment**
```bash
# Start application servers
npm run dev              # Backend (port 3010)
npm start               # Frontend (port 3000)

# Run E2E tests
npm run cypress:open    # Interactive mode with Cypress UI
npm run e2e:dev         # Auto-start servers and run tests
```

**CI/CD Environment**
```bash
# Run headless tests
npm run cypress:run     # All tests headless
npm run e2e:ci          # With server startup
npm run cypress:run -- --spec "frontend/cypress/e2e/features/candidate-management.feature"
```

**Test Execution Options**
```bash
# Run specific feature
npx cypress run --spec "frontend/cypress/e2e/features/auth.feature"

# Run with specific browser
npx cypress run --browser chrome

# Run with tags (if configured)
npx cypress run --env tags="@smoke"

# Generate reports
npx cypress run --reporter mochawesome
```

#### Team Collaboration Benefits

**For Developers**
- Clear acceptance criteria from feature files
- Step definitions guide implementation
- Automatic documentation of system behavior
- Refactoring safety through high-level tests

**For QA Engineers**
- Business-readable test scenarios
- Automated execution of manual test cases
- Easy maintenance of test suites
- Visual test runner for debugging

**For Stakeholders/Product Owners**
- Executable specifications
- Living documentation of system behavior
- Clear understanding of feature completeness
- Direct involvement in test scenario creation

#### Integration with CI/CD

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start application
        run: npm run start:test &
      
      - name: Wait for app to be ready
        run: npx wait-on http://localhost:3000
      
      - name: Run E2E tests
        run: npm run cypress:run
        env:
          CYPRESS_baseUrl: http://localhost:3000
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: frontend/cypress/screenshots
```

#### Test Data Management

**Using Fixtures**
```typescript
// frontend/cypress/fixtures/candidates.json
{
  "validCandidate": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123"
  },
  "invalidData": {
    "email": "invalid-email",
    "phone": "123"
  }
}

// In step definitions
cy.fixture('candidates').then((data) => {
  candidateForm.fillForm(data.validCandidate)
})
```

**Database Seeding for Tests**
```typescript
// frontend/cypress/support/commands.ts
Cypress.Commands.add('seedDatabase', () => {
  cy.task('db:seed')
})

Cypress.Commands.add('cleanDatabase', () => {
  cy.task('db:clean')
})

// In feature setup
Given('there are existing candidates in the system', () => {
  cy.seedDatabase()
})
```

#### Maintenance & Best Practices

**Test Organization**
- **Feature-based**: Group tests by business features
- **Layer separation**: Keep UI logic in page objects
- **Shared steps**: Create common step definitions
- **Test data isolation**: Each test should be independent

**Performance Optimization**
- **Selective testing**: Use tags for test categorization
- **Parallel execution**: Configure for faster CI runs
- **Smart waiting**: Use Cypress built-in retry logic
- **Resource cleanup**: Clean up test data between runs

**Debugging & Reporting**
- **Screenshots on failure**: Automatic visual debugging
- **Video recording**: Full test execution recording
- **Custom reporting**: Integration with test management tools
- **Log aggregation**: Detailed step execution logs

Remember: BDD tests serve as **living documentation** and should be maintained alongside feature development!

## API Development Guidelines

### REST API Conventions
- **Base URL**: `http://localhost:3010/api`
- **HTTP Methods**: GET (read), POST (create), PUT (update), DELETE (delete)
- **Status Codes**: 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 500 (Server Error)
- **Content-Type**: `application/json`

### Endpoint Patterns
```
GET    /api/candidates           # List all candidates
GET    /api/candidates/:id       # Get candidate by ID
POST   /api/candidates           # Create new candidate
PUT    /api/candidates/:id       # Update existing candidate
DELETE /api/candidates/:id       # Delete candidate

# Nested resources
GET    /api/candidates/:id/work-experiences
POST   /api/candidates/:id/work-experiences
```

### Request/Response Guidelines
- **Consistent JSON structure**
- **Validate all inputs** in domain layer
- **Return meaningful error messages**
- **Use proper HTTP status codes**
- **Include relevant data** in responses (avoid over/under-fetching)

### Error Handling
```typescript
// Consistent error response format
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Email format is invalid",
        "details": {
            "field": "email",
            "value": "invalid-email"
        }
    }
}
```

## Database & Prisma Guidelines

### Schema Design Principles
- **Normalized structure** (3NF minimum)
- **Meaningful constraint names**
- **Proper indexing** for performance
- **Use migrations** for all schema changes

### Prisma Best Practices
```bash
# Generate Prisma client after schema changes
npx prisma generate

# Create migration with descriptive name
npx prisma migrate dev --name add_candidate_status_field

# Reset database (development only)
npx prisma migrate reset

# Seed database with test data
ts-node seed.ts
```

### Query Guidelines
- **Use Prisma's type-safe queries**
- **Include necessary relations** only
- **Use transactions** for multi-table operations
- **Handle database errors** gracefully

## Security Guidelines

### Input Validation
- **Validate all inputs** at domain boundaries
- **Sanitize user inputs** to prevent injection
- **Use strong typing** to catch errors early
- **Validate file uploads** (type, size, content)

### API Security
- **CORS properly configured** for frontend communication
- **Environment variables** for sensitive configuration
- **No sensitive data** in client-side code
- **Proper error messages** (don't leak internal information)

## File Organization & Naming

### Directory Structure Standards
```
src/
├── domain/
│   ├── models/           # Domain entities
│   ├── services/         # Domain services
│   ├── repositories/     # Repository interfaces
│   └── value-objects/    # Value objects
├── application/
│   └── services/         # Application services
├── infrastructure/
│   ├── repositories/     # Repository implementations
│   ├── database/         # Database configuration
│   └── external/         # External service integrations
├── presentation/
│   ├── controllers/      # API controllers
│   ├── middlewares/      # Express middlewares
│   └── validators/       # Request validators
└── tests/
    ├── unit/            # Unit tests
    ├── integration/     # Integration tests
    └── fixtures/        # Test data
```

### Import Organization
```typescript
// 1. Node modules
import express from 'express';
import { PrismaClient } from '@prisma/client';

// 2. Internal modules (domain first)
import { Candidate } from '../domain/models/Candidate';
import { CandidateService } from '../application/services/CandidateService';

// 3. Types and interfaces
import type { CandidateData } from '../types/CandidateTypes';
```

## Performance Guidelines

### Backend Performance
- **Use database indexes** for frequently queried fields
- **Implement pagination** for list endpoints
- **Use connection pooling** for database connections
- **Cache frequently accessed data** when appropriate
- **Minimize N+1 queries** with Prisma includes

### Frontend Performance
- **Lazy load components** with React.lazy()
- **Optimize re-renders** with React.memo, useMemo, useCallback
- **Bundle splitting** for code optimization
- **Optimize images** and static assets

## Documentation Standards

### Code Documentation
- **TSDoc comments** for public APIs
- **README files** for each major module
- **API documentation** with Swagger/OpenAPI
- **Inline comments** for complex business logic only

### API Documentation
- **Reference**: `backend/api-spec.yaml` for complete API specification
- **Keep updated** with code changes
- **Include examples** for complex requests/responses

## Common Patterns & Examples

### Repository Pattern Implementation
```typescript
// Domain interface
export interface ICandidateRepository {
    findById(id: number): Promise<Candidate | null>;
    save(candidate: Candidate): Promise<Candidate>;
    delete(id: number): Promise<void>;
}

// Infrastructure implementation
export class PrismaCandidateRepository implements ICandidateRepository {
    constructor(private prisma: PrismaClient) {}
    
    async findById(id: number): Promise<Candidate | null> {
        const data = await this.prisma.candidate.findUnique({
            where: { id },
            include: { educations: true, workExperiences: true }
        });
        return data ? new Candidate(data) : null;
    }
}
```

### Service Layer Pattern
```typescript
export class CandidateApplicationService {
    constructor(
        private candidateRepo: ICandidateRepository,
        private emailService: IEmailService
    ) {}
    
    async createCandidate(data: CandidateData): Promise<Candidate> {
        // 1. Create domain entity (validates business rules)
        const candidate = new Candidate(data);
        
        // 2. Save to repository
        const savedCandidate = await this.candidateRepo.save(candidate);
        
        // 3. Handle side effects
        await this.emailService.sendWelcomeEmail(candidate.email);
        
        return savedCandidate;
    }
}
```

### Error Handling Pattern
```typescript
export class DomainError extends Error {
    constructor(message: string, public code: string) {
        super(message);
        this.name = 'DomainError';
    }
}

// Usage
if (!this.isValidEmail(email)) {
    throw new DomainError('Invalid email format', 'INVALID_EMAIL');
}
```

## Environment Setup

### Required Environment Variables
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydatabase"

# Server
PORT=3010
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads
```

### Docker Services
```yaml
# PostgreSQL configuration
services:
  postgres:
    image: postgres:13
    ports:
      - "5432:5432"
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydatabase
```

## Quality Gates & CI/CD

### Pre-commit Checklist
- [ ] All tests pass (`npm test`)
- [ ] Code is properly formatted (`npm run lint`)
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] API documentation updated if needed
- [ ] Database migrations created if schema changed

### Definition of Done
- [ ] Feature implemented according to requirements
- [ ] Unit tests written and passing
- [ ] Integration tests added for new endpoints
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] No regression in existing functionality

## Troubleshooting

### Common Issues
1. **Prisma client outdated**: Run `npx prisma generate`
2. **Database connection failed**: Check Docker container status
3. **Port conflicts**: Ensure ports 3000, 3010, 5432 are available
4. **TypeScript errors**: Check imports and type definitions
5. **Test failures**: Ensure test database is clean between runs

### Debug Commands
```bash
# Check database connection
npx prisma db pull

# View database in Prisma Studio
npx prisma studio

# Check running Docker containers
docker ps

# View application logs
docker-compose logs -f
```

## References

- **Best Practices Guide**: `backend/ManifestoBuenasPracticas.md`
- **Data Model Documentation**: `backend/ModeloDatos.md`  
- **API Specification**: `backend/api-spec.yaml`
- **Main Documentation**: `README.md`

---

## Quick Commands Reference

```bash
# Development
npm run dev              # Start backend development server
npm start               # Start frontend development server
npm test                # Run tests
npm run build           # Build for production

# Database
npx prisma migrate dev  # Run migrations
npx prisma generate     # Generate Prisma client
npx prisma studio       # Open database GUI

# Docker
docker-compose up -d    # Start PostgreSQL
docker-compose down     # Stop services

# E2E Testing (BDD)
npm run cypress:open    # Interactive Cypress with Cucumber
npm run cypress:run     # Headless E2E tests
npm run e2e:dev         # Start servers + run E2E tests
npm run e2e:ci          # CI-ready E2E test execution

# Code Quality
npm run lint            # Run ESLint
npx prettier --write .  # Format code
npx tsc --noEmit       # Type check
```

Remember: **SOLID, KISS, DRY** - Simple, maintainable code that adds business value!
