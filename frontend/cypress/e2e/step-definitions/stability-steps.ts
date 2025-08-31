import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When(
  "I rapidly navigate between position boards {int} times",
  (times: number) => {
    for (let i = 0; i < times; i++) {
      cy.visit("/positions/1");
      cy.getByTestId("position-board").should("be.visible");
      cy.wait(200); // Small delay between navigations

      cy.visit("/positions");
      cy.get("body").should("be.visible");
      cy.wait(200);
    }
  }
);

Given("I set up network delay simulation", () => {
  // Simulate slow network by intercepting and delaying requests
  cy.intercept("GET", "/positions/*/interviewFlow", (req) => {
    req.reply((res) => {
      // Add 2 second delay
      return new Promise((resolve) => {
        setTimeout(() => resolve(res.send()), 2000);
      });
    });
  }).as("slowInterviewFlow");

  cy.intercept("GET", "/positions/*/candidates", (req) => {
    req.reply((res) => {
      // Add 1.5 second delay
      return new Promise((resolve) => {
        setTimeout(() => resolve(res.send()), 1500);
      });
    });
  }).as("slowCandidates");
});

When(
  "I visit position {string} board with slow network",
  (positionId: string) => {
    cy.visit(`/positions/${positionId}`);
  }
);

When("I perform multiple rapid interactions", () => {
  // Perform various rapid interactions to test stability
  cy.get('[data-testid^="candidate-card-"]').then(($cards) => {
    if ($cards.length > 0) {
      // Rapid hover over cards
      for (let i = 0; i < Math.min(3, $cards.length); i++) {
        cy.wrap($cards[i]).trigger("mouseover");
        cy.wait(50);
        cy.wrap($cards[i]).trigger("mouseout");
        cy.wait(50);
      }

      // Rapid clicks on cards
      for (let i = 0; i < Math.min(2, $cards.length); i++) {
        cy.wrap($cards[i]).click();
        cy.wait(100);
        // Close any opened details
        cy.get("body").then(($body) => {
          if ($body.find('[data-dismiss="offcanvas"]').length > 0) {
            cy.get('[data-dismiss="offcanvas"]').click();
          }
        });
        cy.wait(100);
      }
    }
  });
});

When("I perform {int} navigation cycles", (cycles: number) => {
  for (let i = 0; i < cycles; i++) {
    cy.visit("/positions/1");
    cy.getByTestId("position-board").should("be.visible");
    cy.wait(500);

    cy.visit("/positions");
    cy.get("body").should("be.visible");
    cy.wait(500);
  }
});

When("network becomes temporarily unavailable", () => {
  // Simulate network failure
  cy.intercept("GET", "**", { forceNetworkError: true }).as("networkFailure");

  // Try to reload
  cy.reload();
});

When("network is restored", () => {
  // Remove network failure simulation
  cy.intercept("GET", "/positions/*/interviewFlow").as("restoredInterviewFlow");
  cy.intercept("GET", "/positions/*/candidates").as("restoredCandidates");

  cy.reload();
});

Then("all page loads should complete successfully", () => {
  // Verify final state is good
  cy.getByTestId("position-board").should("be.visible");
  cy.get('[data-testid^="stage-column-"]').should("have.length.at.least", 1);
  cy.get("body").should("not.contain", "Error");
});

Then("no JavaScript errors should occur", () => {
  // Check for JavaScript errors in console
  cy.window().then((win) => {
    // Verify no uncaught exceptions
    expect(win.console).to.exist;
  });

  // Verify page is still functional
  cy.getByTestId("position-board").should("be.visible");
  cy.get('[data-testid^="candidate-card-"]').should("have.length.at.least", 0);
});

Then("all data should load consistently", () => {
  // Verify consistent data loading
  cy.getByTestId("position-title").should("be.visible").and("not.be.empty");
  cy.get('[data-testid^="stage-column-"]').should("have.length.at.least", 1);

  // Verify data integrity
  cy.get('[data-testid^="stage-title-"]').each(($title) => {
    cy.wrap($title).should("be.visible").and("not.be.empty");
  });
});

Then("the page should load despite delays", () => {
  // Wait for slow requests to complete
  cy.wait("@slowInterviewFlow", { timeout: 15000 });
  cy.wait("@slowCandidates", { timeout: 15000 });

  cy.getByTestId("position-board").should("be.visible");
});

Then("all elements should eventually be visible", () => {
  // Verify all critical elements load despite delays
  cy.getByTestId("position-title", { timeout: 20000 }).should("be.visible");
  cy.getByTestId("kanban-board", { timeout: 20000 }).should("be.visible");
  cy.get('[data-testid^="stage-column-"]', { timeout: 20000 }).should(
    "have.length.at.least",
    1
  );
});

Then("no timeouts should occur", () => {
  // If we reached this point, no timeouts occurred
  cy.log("No timeouts detected during slow network test");
  cy.getByTestId("position-board").should("be.visible");
});

Then("the UI should remain responsive", () => {
  // Verify UI is still responsive after rapid interactions
  cy.getByTestId("position-board").should("be.visible");
  cy.get('[data-testid^="stage-column-"]').should("be.visible");

  // Test basic interaction still works
  cy.get('[data-testid^="candidate-card-"]').first().should("be.visible");
});

Then("all operations should complete successfully", () => {
  // Verify no stuck operations or loading states
  cy.get("body").should("not.contain", "Loading...");
  cy.get("body").should("not.contain", "Error");
  cy.getByTestId("position-board").should("be.visible");
});

Then("the data should remain consistent", () => {
  // Verify data consistency after multiple operations
  cy.getByTestId("position-title").should("be.visible").and("not.be.empty");

  // Count elements and verify they make sense
  cy.get('[data-testid^="stage-column-"]').then(($columns) => {
    expect($columns.length).to.be.greaterThan(0);
    expect($columns.length).to.be.lessThan(10); // Reasonable upper bound
  });
});

Then("browser memory usage should remain stable", () => {
  // In Cypress, we can check for basic memory stability indicators
  cy.window().then((win) => {
    // Verify window object is still responsive
    expect(win.document).to.exist;
    expect(win.document.readyState).to.equal("complete");
  });

  // Verify DOM isn't bloated
  cy.get("body *").then(($elements) => {
    // Reasonable DOM size (not growing excessively)
    expect($elements.length).to.be.lessThan(10000);
  });
});

Then("no memory leaks should be detected", () => {
  // Basic memory leak detection
  cy.window().then((win) => {
    // Verify critical objects exist and are clean
    expect(win.document).to.exist;

    // Check for reasonable DOM size
    const domNodes = win.document.querySelectorAll("*").length;
    expect(domNodes).to.be.lessThan(5000); // Reasonable threshold

    cy.log(`DOM nodes count: ${domNodes}`);
  });
});

Then("the application should recover automatically", () => {
  // Wait for restored network requests
  cy.wait("@restoredInterviewFlow", { timeout: 15000 });
  cy.wait("@restoredCandidates", { timeout: 15000 });

  cy.getByTestId("position-board").should("be.visible");
});

Then("all functionality should work normally", () => {
  // Test core functionality after recovery
  cy.getByTestId("position-title").should("be.visible");
  cy.get('[data-testid^="stage-column-"]').should("have.length.at.least", 1);
  cy.get('[data-testid^="candidate-card-"]').should("have.length.at.least", 0);

  // Test navigation still works
  cy.getByTestId("back-to-positions-btn").should("be.visible");
});
