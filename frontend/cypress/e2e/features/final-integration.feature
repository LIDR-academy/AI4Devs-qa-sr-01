Feature: Final Integration Test - Position Board E2E
  As a recruiter
  I want to move candidates between phases with full validation
  So that I can confirm the complete workflow works end-to-end

  Background:
    Given I am logged in as a recruiter

  Scenario: Complete workflow - Load, Display, Move, Update
    Given I set up API monitoring for the complete workflow
    When I visit position "1" board
    Then I should see the position title displayed
    And I should see interview phase columns
    And I should see candidates in their current phases
    When I move the first available candidate to a different phase
    Then the candidate should move visually
    And the backend should receive the update request
    And the data should persist correctly

  Scenario: Verify all core requirements are met
    When I visit position "1" board
    Then the position title shows correctly
    And all phase columns are displayed
    And candidate cards appear in correct columns
    And drag and drop functionality works
    And backend integration is functional
