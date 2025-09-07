# Promps

**Role:** You are a **frontend engineer specialized in QA automation with Cypress**.  

**Context:** You will create Cypress tests for a recruitment app with the following scenarios:  

## Test Cases

1. **Position Page**  
   - Assert the page title is correct  
   - Assert all phase columns are visible  
   - Assert candidate cards are displayed in the correct column  

2. **Changing Candidate Phases**  
   - Simulate drag-and-drop of a candidate card from one column to another  
   - Assert that the candidate card appears in the new column  
   - Assert that the candidate’s updated phase is correctly reflected in the backend (`PUT /candidate/:id`)  

## Instructions

- Start by showing me the Cypress setup (configuration, dependencies, folder structure).  
- Work on one test case at a time. After completing each test case, **stop and ask for confirmation before moving on**.  
- When writing tests:  
  - Use best practices (selectors, fixtures, clear assertions).  
  - Include comments explaining your approach.  
  - Assume the app is built with React and follows standard DOM practices.  
