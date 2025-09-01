Feature: Simple Drag & Drop Test
  As a QA engineer
  I want to verify the drag & drop works visually
  So that I can confirm the plugin integration is successful

  Background:
    Given I am logged in as a recruiter

  Scenario: Basic drag & drop functionality
    When I visit position "1" board
    Then I should see candidate cards
    When I perform a simple drag & drop operation
    Then the operation should complete without errors
