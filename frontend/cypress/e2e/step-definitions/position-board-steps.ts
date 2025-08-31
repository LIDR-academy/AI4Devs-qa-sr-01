import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I visit position {string} board", (positionId: string) => {
  cy.visit(`/positions/${positionId}`);

  // Wait for the page to load completely
  cy.getByTestId("position-board").should("exist");
});

Then("I should see the position title", () => {
  cy.getByTestId("position-title").should("be.visible");
  cy.getByTestId("position-title").should("not.be.empty");
});

Then("I should see the kanban board with interview phases", () => {
  cy.getByTestId("kanban-board").should("exist");

  // We should have at least one stage column
  cy.get('[data-testid^="stage-column-"]').should("have.length.at.least", 1);
});

Then("I should see stage columns with proper data-testids", () => {
  // Verify stage columns exist
  cy.get('[data-testid^="stage-column-"]').should("exist");

  // Verify stage titles exist
  cy.get('[data-testid^="stage-title-"]').should("exist");

  // Verify stage bodies exist
  cy.get('[data-testid^="stage-body-"]').should("exist");
});

Then("I should see the position board container", () => {
  cy.getByTestId("position-board").should("be.visible");
  cy.getByTestId("position-board").should("have.class", "container");
});

Then("I should see the back to positions button", () => {
  cy.getByTestId("back-to-positions-btn").should("be.visible");
  cy.getByTestId("back-to-positions-btn").should(
    "contain.text",
    "Volver a Posiciones"
  );
});

Then("I should see the kanban board layout", () => {
  cy.getByTestId("kanban-board").should("be.visible");
  cy.getByTestId("kanban-board").should("have.class", "row");
});
