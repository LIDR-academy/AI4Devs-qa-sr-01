Feature: Authentication
  As a recruiter  
  I want to access the application securely
  So that I can manage candidates and positions

  Background:
    Given I am logged in as a recruiter

  Scenario: Successful login maintains session
    When I visit the dashboard
    Then I should see the recruiter dashboard
    And my session should be valid
    
  Scenario: Session persists across page navigation
    When I navigate to positions page
    Then I should access the positions page
    And my session should remain active
