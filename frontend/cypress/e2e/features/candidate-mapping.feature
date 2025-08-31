Feature: Candidate Mapping by Phase
  As a recruiter
  I want to see candidates organized by their current interview phase
  So that I can track where each candidate is in the process

  Background:
    Given I am logged in as a recruiter

  Scenario: Verify candidates appear in correct phase columns
    When I visit position "1" board
    Then I should see candidates distributed across interview phases
    And each candidate card should display proper information
    And candidates should be grouped by their current interview step

  Scenario: Verify candidate card structure
    When I visit position "1" board
    And I can see candidate cards
    Then each candidate card should have a name
    And each candidate card should have a rating display
    And each candidate card should be clickable

  Scenario: Verify stage columns contain candidates
    When I visit position "1" board
    Then I should see at least one stage column with candidates
    And each stage should have a clear title
    And each stage body should be accessible for interactions
