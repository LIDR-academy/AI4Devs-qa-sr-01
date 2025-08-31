/// <reference types="cypress" />

// Custom command declarations
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via session
       */
      loginAsUser(): Chainable<void>;

      /**
       * Custom command for robust drag and drop with react-beautiful-dnd
       */
      dragAndDrop(
        sourceSelector: string,
        targetSelector: string
      ): Chainable<void>;

      /**
       * Custom command to get element by data-testid
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Custom command to seed database for tests
       */
      seedDatabase(): Chainable<void>;

      /**
       * Custom command to clean database after tests
       */
      cleanDatabase(): Chainable<void>;
    }
  }
}

// Implementation of custom commands

/**
 * Login command using cy.session for performance
 * Since this app doesn't have complex auth, we simulate a valid session
 */
Cypress.Commands.add("loginAsUser", () => {
  cy.session(
    "recruiter-session",
    () => {
      // Visit the app and wait for it to load completely
      cy.visit("/", { timeout: 30000 });
      cy.get("#root", { timeout: 15000 }).should("exist");

      // Simulate setting user session data that the app might expect
      cy.window().then((win) => {
        // Set realistic session data for a recruiter
        win.localStorage.setItem("user-role", "recruiter");
        win.localStorage.setItem("user-id", "1");
        win.localStorage.setItem("session-token", "test-session-" + Date.now());

        // Mark as authenticated
        win.localStorage.setItem("isAuthenticated", "true");
      });

      // Ensure the dashboard is accessible
      cy.url().should("include", "/");
      cy.get("body").should("be.visible");
    },
    {
      validate: () => {
        // Validate that session is still valid
        cy.window().then((win) => {
          expect(win.localStorage.getItem("user-role")).to.equal("recruiter");
          expect(win.localStorage.getItem("isAuthenticated")).to.equal("true");
        });

        // Verify we can access the app
        cy.get("#root").should("exist");
      },
      cacheAcrossSpecs: true, // Share session across test specs for performance
    }
  );
});

/**
 * Robust drag and drop for react-beautiful-dnd
 * Specifically designed to work with react-beautiful-dnd library
 */
Cypress.Commands.add(
  "dragAndDrop",
  (sourceSelector: string, targetSelector: string) => {
    cy.get(sourceSelector).should("be.visible");
    cy.get(targetSelector).should("be.visible");

    // Get the source element (candidate card)
    cy.get(sourceSelector).then(($source) => {
      // Get the target element (destination stage)
      cy.get(targetSelector).then(($target) => {
        const sourceCoords = $source[0].getBoundingClientRect();
        const targetCoords = $target[0].getBoundingClientRect();

        // Start the drag operation
        cy.get(sourceSelector)
          .trigger("mousedown", {
            which: 1,
            pageX: sourceCoords.x + sourceCoords.width / 2,
            pageY: sourceCoords.y + sourceCoords.height / 2,
          })
          .wait(100); // Small delay for react-beautiful-dnd to register

        // Move to target position
        cy.get(sourceSelector)
          .trigger("mousemove", {
            which: 1,
            pageX: targetCoords.x + targetCoords.width / 2,
            pageY: targetCoords.y + targetCoords.height / 2,
          })
          .wait(100); // Allow time for drag feedback

        // Complete the drop with more events
        cy.get(targetSelector)
          .trigger("mouseover")
          .trigger("mouseup", {
            pageX: targetCoords.x + targetCoords.width / 2,
            pageY: targetCoords.y + targetCoords.height / 2,
          })
          .trigger("drop");

        // Wait longer for react-beautiful-dnd to process and trigger API
        cy.wait(2000);
      });
    });
  }
);

/**
 * Get element by data-testid with better error messages
 */
Cypress.Commands.add("getByTestId", (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`, { timeout: 10000 });
});

/**
 * Database seeding - to be implemented with backend integration
 */
Cypress.Commands.add("seedDatabase", () => {
  // Placeholder - will be implemented with proper backend integration
  cy.log("Database seeding - to be implemented");
});

/**
 * Database cleanup - to be implemented with backend integration
 */
Cypress.Commands.add("cleanDatabase", () => {
  // Placeholder - will be implemented with proper backend integration
  cy.log("Database cleanup - to be implemented");
});

export {};
