Feature: Sanity Check
  As a developer
  I want to verify Cypress + Cucumber setup works
  So that I can proceed with Position board testing

  Scenario: Cypress and Cucumber are working
    Given I visit the homepage
    When I check the page title
    Then I should see a valid React application
