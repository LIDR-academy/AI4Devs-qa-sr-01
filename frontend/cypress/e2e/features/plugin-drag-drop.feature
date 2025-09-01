Feature: Plugin Drag & Drop Integration Test
  As a QA engineer
  I want to verify the @4tw/cypress-drag-drop plugin works correctly
  So that we can use the official solution for drag & drop testing

  Background:
    Given I am logged in as a recruiter
    And I set up API monitoring for drag & drop operations

  Scenario: Test official plugin drag & drop
    When I visit position "1" board
    Then I should see candidate cards available for dragging
    When I drag the first candidate to a different stage using the plugin
    Then the drag & drop should complete successfully
    And the PUT request should be sent to update the candidate

  Scenario: Verify plugin handles react-beautiful-dnd correctly
    When I visit position "1" board
    And I identify source and target stages
    Then the drag operation should work smoothly
    And the drop should trigger the correct API call
