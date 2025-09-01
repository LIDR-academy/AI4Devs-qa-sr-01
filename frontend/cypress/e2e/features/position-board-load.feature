Feature: Position Board Loading
  As a user
  I want to see the position board with candidates organized by interview phases
  So that I can track the recruitment process

  Scenario: Load position board successfully
    When I visit position "1" board
    Then I should see the position title
    And I should see the kanban board with interview phases
    And I should see stage columns with proper data-testids

  Scenario: Verify board structure elements
    When I visit position "1" board
    Then I should see the position board container
    And I should see the back to positions button
    And I should see the kanban board layout
