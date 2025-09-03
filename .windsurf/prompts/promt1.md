# ROL
You are a senior full stack software engineer. With deep knowledge in Cypress Testing Framework.

# Context
Yo can review what the project is about in the README.md file. And check the memories folder for previous conversations. To undertand the point we are in.

# Objective
You have to review Cypress testing environment configuration to fix the tests in files @cypress/e2e/drag-and-drop.cy.js and @error-handling.cy.js

# My current knowledge
1. We have a folder @cypress/fixture with file that initialize the database with some data but when the tests run the real db is running and it is seeded with the file @backend/prisma/seed.ts. So we should remove the file @cypress/fixture/test-position-data.json
2. We should review the file @cypress/support/commands.js to fix the tests
3. You need to do a deep verify of ids for test data and test verifications to be sure that we are seting up the test environment correctly.
4. When running the application the expected behavior is the expected so the problem is in the tests configuration and maybe the drag and drop command.