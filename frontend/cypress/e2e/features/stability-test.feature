Feature: Test Stability and Anti-Flakiness
  As a QA engineer
  I want tests to be stable and reliable
  So that CI/CD pipelines are trustworthy

  Background:
    Given I am logged in as a recruiter

  Scenario: Stress test - Multiple rapid page loads
    When I rapidly navigate between position boards 5 times
    Then all page loads should complete successfully
    And no JavaScript errors should occur
    And all data should load consistently

  Scenario: Network delay simulation
    Given I set up network delay simulation
    When I visit position "1" board with slow network
    Then the page should load despite delays
    And all elements should eventually be visible
    And no timeouts should occur

  Scenario: Concurrent operations stability
    Given I can see candidate cards in the board
    When I perform multiple rapid interactions
    Then the UI should remain responsive
    And all operations should complete successfully
    And the data should remain consistent

  Scenario: Memory leak detection
    Given I visit position "1" board
    When I perform 10 navigation cycles
    Then browser memory usage should remain stable
    And no memory leaks should be detected

  Scenario: Retry mechanism validation
    Given I visit position "1" board
    When network becomes temporarily unavailable
    And network is restored
    Then the application should recover automatically
    And all functionality should work normally
