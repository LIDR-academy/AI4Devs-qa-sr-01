Feature: Candidate Drag and Drop
  As a recruiter
  I want to move candidates between interview phases using drag and drop
  So that I can efficiently update candidate status in the recruitment process

  Background:
    Given I am logged in as a recruiter
    And I visit position "1" board

  Scenario: Move candidate to different interview phase
    Given I can see candidate cards in the board
    When I drag a candidate from one phase to another phase
    Then the candidate should appear in the new phase
    And the candidate should be removed from the original phase
    And the backend should be updated with the new phase

  Scenario: Drag and drop visual feedback
    Given I can see candidate cards in the board
    When I start dragging a candidate
    Then I should see visual feedback during the drag operation
    And the candidate should move to the target location when dropped

  Scenario: Invalid drag operations
    Given I can see candidate cards in the board
    When I attempt to drag a candidate to an invalid location
    Then the candidate should return to its original position
    And no backend update should occur
