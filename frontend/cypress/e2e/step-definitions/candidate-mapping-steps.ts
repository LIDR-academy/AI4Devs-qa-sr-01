import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Then("I should see candidates distributed across interview phases", () => {
  // Verify we have stage columns
  cy.get('[data-testid^="stage-column-"]').should("have.length.at.least", 1);

  // Check that at least some stages have candidates
  cy.get('[data-testid^="stage-body-"]').should("exist");

  // Verify candidate cards exist in at least one stage
  cy.get('[data-testid^="candidate-card-"]')
    .should("have.length.at.least", 1)
    .should("be.visible");
});

When("I can see candidate cards", () => {
  cy.get('[data-testid^="candidate-card-"]')
    .should("exist")
    .should("be.visible");
});

Then("each candidate card should display proper information", () => {
  cy.get('[data-testid^="candidate-card-"]').each(($card) => {
    // Each card should have a name
    cy.wrap($card)
      .find('[data-testid^="candidate-name-"]')
      .should("exist")
      .should("not.be.empty");

    // Each card should have a rating area (even if rating is 0)
    cy.wrap($card).find('[data-testid^="candidate-rating-"]').should("exist");
  });
});

Then("candidates should be grouped by their current interview step", () => {
  // Verify that candidates appear within stage bodies
  cy.get('[data-testid^="stage-body-"]').should("exist");

  // Check that at least some candidates exist somewhere in the board
  cy.get('[data-testid^="candidate-card-"]').should("have.length.at.least", 1);

  // Verify candidates are properly nested within stages
  cy.get('[data-testid^="stage-body-"]').then(($stages) => {
    let foundCandidates = false;

    $stages.each((index, stage) => {
      const candidatesInStage = Cypress.$(stage).find(
        '[data-testid^="candidate-card-"]'
      );
      if (candidatesInStage.length > 0) {
        foundCandidates = true;
        // Verify these candidates are visible
        cy.wrap(candidatesInStage).each(($candidate) => {
          cy.wrap($candidate).should("be.visible");
        });
      }
    });

    expect(foundCandidates).to.be.true;
  });
});

Then("each candidate card should have a name", () => {
  cy.get('[data-testid^="candidate-card-"]').each(($card) => {
    cy.wrap($card)
      .find('[data-testid^="candidate-name-"]')
      .should("exist")
      .should("be.visible")
      .should("not.be.empty");
  });
});

Then("each candidate card should have a rating display", () => {
  cy.get('[data-testid^="candidate-card-"]').each(($card) => {
    cy.wrap($card).find('[data-testid^="candidate-rating-"]').should("exist");
  });
});

Then("each candidate card should be clickable", () => {
  cy.get('[data-testid^="candidate-card-"]').each(($card) => {
    // Verify cards are clickable (have pointer cursor or similar)
    cy.wrap($card).should("be.visible");

    // Test that we can interact with the card (hover should work)
    cy.wrap($card).trigger("mouseover");
  });
});

Then("I should see at least one stage column with candidates", () => {
  // Find stages that contain candidates
  cy.get('[data-testid^="stage-body-"]').then(($stages) => {
    let hasCandidate = false;

    $stages.each((index, stage) => {
      if (
        Cypress.$(stage).find('[data-testid^="candidate-card-"]').length > 0
      ) {
        hasCandidate = true;
      }
    });

    expect(hasCandidate).to.be.true;
  });
});

Then("each stage should have a clear title", () => {
  cy.get('[data-testid^="stage-column-"]').each(($column) => {
    cy.wrap($column)
      .find('[data-testid^="stage-title-"]')
      .should("exist")
      .should("be.visible")
      .should("not.be.empty");
  });
});

Then("each stage body should be accessible for interactions", () => {
  cy.get('[data-testid^="stage-body-"]').each(($body) => {
    cy.wrap($body).should("exist").should("be.visible");
  });
});
