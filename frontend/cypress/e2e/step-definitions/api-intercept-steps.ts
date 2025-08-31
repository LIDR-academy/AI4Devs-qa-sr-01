import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given("I set up API intercepts for candidate updates", () => {
  // Intercept the PUT request to update candidate
  cy.intercept("PUT", "/candidates/*", {
    statusCode: 200,
    body: { success: true, message: "Candidate updated successfully" },
  }).as("updateCandidate");

  // Also intercept any GET requests for refreshing data
  cy.intercept("GET", "/positions/*/candidates", {
    fixture: "candidates.json",
  }).as("getCandidates");
});

Given("I set up API intercepts for position data", () => {
  // Intercept position interview flow
  cy.intercept("GET", "/positions/*/interviewFlow").as("getInterviewFlow");

  // Intercept candidates data
  cy.intercept("GET", "/positions/*/candidates").as("getCandidates");
});

Given("I set up API intercepts with error responses", () => {
  // Set up intercept that returns error
  cy.intercept("PUT", "/candidates/*", {
    statusCode: 500,
    body: { error: "Internal server error" },
  }).as("updateCandidateError");
});

When("I attempt to move a candidate to a different phase", () => {
  // Find available candidates and stages
  cy.get('[data-testid^="candidate-card-"]')
    .first()
    .then(($candidate) => {
      const candidateId = $candidate.attr("data-testid");
      cy.wrap(candidateId).as("testCandidateId");

      // Get the candidate's current stage
      cy.wrap($candidate)
        .parent()
        .parent()
        .then(($currentStage) => {
          const currentStageId = $currentStage.attr("data-testid");
          cy.wrap(currentStageId).as("currentStageId");

          // Find a different stage to move to
          cy.get('[data-testid^="stage-body-"]').then(($stages) => {
            let targetStage = null;

            for (let i = 0; i < $stages.length; i++) {
              const stage = $stages[i];
              const stageId = Cypress.$(stage).attr("data-testid");
              if (stageId !== currentStageId) {
                targetStage = stage;
                break;
              }
            }

            if (targetStage) {
              const targetStageId = Cypress.$(targetStage).attr("data-testid");
              cy.wrap(targetStageId).as("targetStageId");

              // Attempt the drag and drop
              cy.dragAndDrop(
                `[data-testid="${candidateId}"]`,
                `[data-testid="${targetStageId}"]`
              );
            }
          });
        });
    });
});

When("I reload the position board", () => {
  cy.reload();
  cy.getByTestId("position-board").should("be.visible");
});

Then("a PUT request should be made to update the candidate", () => {
  // Wait for and verify the PUT request was made
  cy.wait("@updateCandidate", { timeout: 10000 }).then((interception) => {
    expect(interception.request.method).to.equal("PUT");
    expect(interception.request.url).to.include("/candidates/");

    // Store the request details for further verification
    cy.wrap(interception).as("candidateUpdateRequest");
  });
});

Then("the request payload should contain the correct data", () => {
  cy.get("@candidateUpdateRequest").then((interception: any) => {
    const requestBody = interception.request.body;

    // Verify the request contains expected fields
    expect(requestBody).to.have.property("applicationId");
    expect(requestBody).to.have.property("currentInterviewStep");

    // Verify applicationId is a number
    expect(requestBody.applicationId).to.be.a("number");
    expect(requestBody.applicationId).to.be.greaterThan(0);

    // Verify currentInterviewStep is a number (stage ID)
    expect(requestBody.currentInterviewStep).to.be.a("number");
    expect(requestBody.currentInterviewStep).to.be.greaterThan(0);

    cy.log(`Request payload: ${JSON.stringify(requestBody)}`);
  });
});

Then("the response should be successful", () => {
  cy.get("@candidateUpdateRequest").then((interception: any) => {
    expect(interception.response.statusCode).to.equal(200);
    expect(interception.response.body).to.have.property("success", true);
  });
});

Then("the UI should reflect the updated status", () => {
  // Verify that the UI shows the candidate in the new position
  cy.get("@testCandidateId").then((candidateId) => {
    cy.get("@targetStageId").then((targetStageId) => {
      // Check that the candidate appears in the target stage
      cy.get(`[data-testid="${targetStageId}"]`)
        .find(`[data-testid="${candidateId}"]`)
        .should("exist");
    });
  });
});

Then("I should see requests for position interview flow", () => {
  cy.wait("@getInterviewFlow", { timeout: 10000 }).then((interception) => {
    expect(interception.request.method).to.equal("GET");
    expect(interception.request.url).to.include("/interviewFlow");
  });
});

Then("I should see requests for candidates data", () => {
  cy.wait("@getCandidates", { timeout: 10000 }).then((interception) => {
    expect(interception.request.method).to.equal("GET");
    expect(interception.request.url).to.include("/candidates");
  });
});

Then("all requests should complete successfully", () => {
  // Verify that all intercepted requests had successful responses
  cy.get("@getInterviewFlow").then((interception: any) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 304]);
  });

  cy.get("@getCandidates").then((interception: any) => {
    expect(interception.response.statusCode).to.be.oneOf([200, 304]);
  });
});

Then("the API call should fail gracefully", () => {
  cy.wait("@updateCandidateError", { timeout: 10000 }).then((interception) => {
    expect(interception.response.statusCode).to.equal(500);
  });
});

Then("the UI should handle the error appropriately", () => {
  // In a real application, we might check for error messages or toasts
  // For now, we'll just verify the UI doesn't crash
  cy.getByTestId("position-board").should("be.visible");
  cy.get('[data-testid^="candidate-card-"]').should("have.length.at.least", 1);
});

Then("the candidate should remain in the original position", () => {
  // Verify candidate is still in the original stage after error
  cy.get("@testCandidateId").then((candidateId) => {
    cy.get("@currentStageId").then((currentStageId) => {
      cy.get(`[data-testid="${currentStageId}"]`)
        .find(`[data-testid="${candidateId}"]`)
        .should("exist");
    });
  });
});
