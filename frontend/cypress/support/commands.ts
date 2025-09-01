/// <reference types="cypress" />
/// <reference types="@4tw/cypress-drag-drop" />

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
 * Hybrid drag and drop: Plugin for visual + Manual events for API
 * Combines the reliability of @4tw/cypress-drag-drop with manual event triggering
 */
Cypress.Commands.add(
  "dragAndDrop",
  (sourceSelector: string, targetSelector: string) => {
    cy.get(sourceSelector).should("be.visible");
    cy.get(targetSelector).should("be.visible");

    // Step 1: Use the official plugin for visual drag & drop
    cy.get(sourceSelector).drag(targetSelector, {
      force: true,
      timeout: 15000,
    });

    // Step 2: Wait for visual completion
    cy.wait(2000);

    // Step 3: Manually trigger the events that react-beautiful-dnd expects
    // This ensures the API call is triggered even if the plugin doesn't
    cy.get(sourceSelector).then(($source) => {
      const sourceEl = $source[0];

      // Create and dispatch the events that react-beautiful-dnd needs
      const dragEndEvent = new Event("dragend", { bubbles: true });
      const dropEvent = new Event("drop", { bubbles: true });

      // Set up dataTransfer for the events
      Object.defineProperty(dragEndEvent, "dataTransfer", {
        value: {
          setData: () => {},
          getData: () => "",
          types: [],
          files: [],
          effectAllowed: "all",
          dropEffect: "move",
        },
      });

      Object.defineProperty(dropEvent, "dataTransfer", {
        value: {
          setData: () => {},
          getData: () => "",
          types: [],
          files: [],
          effectAllowed: "all",
          dropEffect: "move",
        },
      });

      // Dispatch the events
      sourceEl.dispatchEvent(dragEndEvent);
      cy.wait(500);

      // Also try to trigger on the target
      cy.get(targetSelector).then(($target) => {
        const targetEl = $target[0];
        targetEl.dispatchEvent(dropEvent);
        cy.wait(1000);
      });
    });

    // Step 4: Final wait for any API calls
    cy.wait(2000);
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

// Import cypress-drag-drop plugin
import "@4tw/cypress-drag-drop";

export {};
