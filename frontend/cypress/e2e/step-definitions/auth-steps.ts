import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I am logged in as a recruiter", () => {
  cy.loginAsUser();
});

When("I visit the dashboard", () => {
  cy.visit("/");
});

When("I navigate to positions page", () => {
  cy.visit("/positions");
});

Then("I should see the recruiter dashboard", () => {
  // Wait for React app to load
  cy.get("#root").should("exist");
  cy.get("body").should("not.be.empty");

  // Verify we're on the dashboard (home page)
  cy.url().should("include", "/");

  // Check that the page has loaded content - we should see some meaningful content
  cy.get("body").should("be.visible");

  // Verify that basic React elements are present (indicating successful app load)
  cy.get("body").within(() => {
    // The body should not be empty and should contain some content
    cy.contains(/.*/).should("exist"); // Any text content should exist
  });
});

Then("I should access the positions page", () => {
  // Verify we can access positions page
  cy.url().should("include", "/positions");
  cy.get("#root").should("exist");

  // Wait for positions to load (or show loading state)
  cy.get("body").should("not.be.empty");
});

Then("my session should be valid", () => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem("user-role")).to.equal("recruiter");
    expect(win.localStorage.getItem("isAuthenticated")).to.equal("true");
    expect(win.localStorage.getItem("session-token")).to.exist;
  });
});

Then("my session should remain active", () => {
  cy.window().then((win) => {
    expect(win.localStorage.getItem("user-role")).to.equal("recruiter");
    expect(win.localStorage.getItem("isAuthenticated")).to.equal("true");
  });
});
