Feature: API Integration Testing
  As a recruiter
  I want to ensure that candidate phase changes are properly saved to the backend
  So that the data is persistent and accurate

  Background:
    Given I am logged in as a recruiter
    And I visit position "1" board

  Scenario: Verify PUT request when moving candidate phase
    Given I can see candidate cards in the board
    And I set up API intercepts for candidate updates
    When I attempt to move a candidate to a different phase
    Then a PUT request should be made to update the candidate
    And the request payload should contain the correct data
    And the response should be successful
    And the UI should reflect the updated status

  Scenario: Monitor API calls during position board load
    Given I set up API intercepts for position data
    When I reload the position board
    Then I should see requests for position interview flow
    And I should see requests for candidates data
    And all requests should complete successfully

  Scenario: Verify API error handling
    Given I can see candidate cards in the board
    And I set up API intercepts with error responses
    When I attempt to move a candidate to a different phase
    Then the API call should fail gracefully
    And the UI should handle the error appropriately
    And the candidate should remain in the original position
