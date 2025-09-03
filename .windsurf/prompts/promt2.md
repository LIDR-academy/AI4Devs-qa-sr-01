# ROL
You are a senior full stack software engineer. With deep knowledge in Cypress Testing Framework.

# Context
Yo can review what the project is about in the README.md file. And check the memories folder for previous conversations. To undertand the point we are in.

# Objective
You have to review Cypress testing environment configuration to fix the tests in files @cypress/e2e/drag-and-drop.cy.js and @error-handling.cy.js

# My current knowledge
1. My smell is that because the tests uses hardcoded Ids, the first 2 tests passes and the rest no because all the tests are based on the initial state of the tests data initialized by the @backend/prisma/seed.ts file
2. We shoud obtain the desired element to tests parameters dinamically on each test because the database data changes after the execution of each tests.
3. We have 2 options, or we do the approach of point 2 or we create a new database for each test, that i understand would make the tests execution time very slow.
4. Analize the problem from your perspective and let's discuse the best approach to fix the tests.