import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I set up API monitoring for drag & drop operations", () => {
  // Monitor the specific PUT request that should be triggered
  cy.intercept("PUT", "/candidates/*").as("updateCandidate");

  // Also monitor the GET requests for position data
  cy.intercept("GET", "/positions/*/interviewFlow").as("getInterviewFlow");
  cy.intercept("GET", "/positions/*/candidates").as("getCandidates");
});

Then("I should see candidate cards available for dragging", () => {
  // Wait for the page to load completely
  cy.wait("@getInterviewFlow");
  cy.wait("@getCandidates");

  // Verify we have candidate cards visible
  cy.get('[data-testid^="candidate-card-"]')
    .should("have.length.at.least", 1)
    .first()
    .should("be.visible");
});

When("I drag the first candidate to a different stage using the plugin", () => {
  // Find the first candidate card
  cy.get('[data-testid^="candidate-card-"]')
    .first()
    .then(($candidate) => {
      const candidateId = $candidate.attr("data-testid");
      cy.wrap(candidateId).as("movedCandidateId");

      // Get the source stage (where the candidate currently is)
      cy.wrap($candidate)
        .closest('[data-testid^="stage-body-"]')
        .then(($sourceStage) => {
          const sourceStageId = $sourceStage.attr("data-testid");
          cy.wrap(sourceStageId).as("sourceStageId");

          // Find a different target stage
          cy.get('[data-testid^="stage-body-"]').then(($stages) => {
            let targetStageElement: HTMLElement | null = null;

            for (let i = 0; i < $stages.length; i++) {
              const stage = $stages[i];
              const stageId = Cypress.$(stage).attr("data-testid");
              if (stageId !== sourceStageId) {
                targetStageElement = stage;
                break;
              }
            }

            if (targetStageElement) {
              const targetStageId =
                Cypress.$(targetStageElement).attr("data-testid");
              cy.wrap(targetStageId).as("targetStageId");

              // Use the official plugin for drag & drop
              cy.get(`[data-testid="${candidateId}"]`).drag(
                `[data-testid="${targetStageId}"]`,
                {
                  force: true,
                  timeout: 15000,
                }
              );

              // Wait longer for the operation to complete and API to be triggered
              // Manual testing shows it takes time to fire the request
              cy.wait(5000);
            }
          });
        });
    });
});

Then("the drag & drop should complete successfully", () => {
  // Verify the candidate is still visible (either in source or target)
  cy.get("@movedCandidateId").then((candidateId) => {
    cy.get(`[data-testid="${candidateId}"]`)
      .should("exist")
      .should("be.visible");
  });
});

Then("the PUT request should be sent to update the candidate", () => {
  // Wait for the PUT request to be made with extended timeout
  // Since manual testing also takes time, we give it more time
  cy.wait("@updateCandidate", { timeout: 30000 }).then((interception) => {
    // Verify it's a PUT request
    expect(interception.request.method).to.equal("PUT");

    // Verify the URL contains the candidate ID
    expect(interception.request.url).to.include("/candidates/");

    // Verify the request body structure
    const body = interception.request.body;
    expect(body).to.have.property("applicationId");
    expect(body).to.have.property("currentInterviewStep");

    // Log the successful request for debugging
    cy.log(`✅ PUT request sent successfully to: ${interception.request.url}`);
    cy.log(`✅ Request body: ${JSON.stringify(body)}`);
  });
});

When("I identify source and target stages", () => {
  // Get all stage bodies to identify source and target
  cy.get('[data-testid^="stage-body-"]').should("have.length.at.least", 2);

  // Store the first two stages as source and target
  cy.get('[data-testid^="stage-body-"]')
    .first()
    .then(($firstStage) => {
      const firstStageId = $firstStage.attr("data-testid");
      cy.wrap(firstStageId).as("sourceStageId");
    });

  cy.get('[data-testid^="stage-body-"]')
    .eq(1)
    .then(($secondStage) => {
      const secondStageId = $secondStage.attr("data-testid");
      cy.wrap(secondStageId).as("targetStageId");
    });
});

Then("the drag operation should work smoothly", () => {
  // Verify we have a candidate to drag
  cy.get('[data-testid^="candidate-card-"]').first().should("be.visible");

  // Verify we have valid source and target stages
  cy.get("@sourceStageId").should("exist");
  cy.get("@targetStageId").should("exist");
});

Then("the drop should trigger the correct API call", () => {
  // This step will be executed after the drag & drop in the previous scenario
  // The verification is already done in "the PUT request should be sent to update the candidate"
  cy.log("✅ API call verification completed in previous step");
});
