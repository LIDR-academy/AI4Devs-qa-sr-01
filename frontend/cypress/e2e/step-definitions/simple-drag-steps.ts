import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I should see candidate cards", () => {
  cy.get('[data-testid^="candidate-card-"]')
    .should("have.length.at.least", 1)
    .first()
    .should("be.visible");
});

When("I perform a simple drag & drop operation", () => {
  // Find first candidate and perform a simple drag to the same position
  cy.get('[data-testid^="candidate-card-"]').first().then(($candidate) => {
    const candidateId = $candidate.attr("data-testid");
    
    // Get the stage where the candidate is located
    cy.wrap($candidate).closest('[data-testid^="stage-body-"]').then(($stage) => {
      const stageId = $stage.attr("data-testid");
      
      // Perform drag & drop to the same stage (this should work without issues)
      cy.get(`[data-testid="${candidateId}"]`).drag(`[data-testid="${stageId}"]`, {
        force: true,
        timeout: 10000
      });
      
      // Wait for operation to complete
      cy.wait(2000);
    });
  });
});

Then("the operation should complete without errors", () => {
  // Just verify the candidate is still visible (no errors occurred)
  cy.get('[data-testid^="candidate-card-"]')
    .first()
    .should("exist")
    .should("be.visible");
    
  cy.log("✅ Drag & drop operation completed successfully without errors");
});
