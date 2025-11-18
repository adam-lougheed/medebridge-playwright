@Homepage
Feature: Homepage Loading
  As a user
  I want to verify the homepage loads correctly
  So that I can ensure the application is working

  Scenario: Homepage loads with correct title
    Given I navigate to the homepage
    When the page loads
    Then the page title should match the expected pattern

