---
trigger: manual
---

## Thisis a set of good practices for testing with Cypress Framework

### \#\# 1. Use Data-Specific Attributes for Selectors

This is the most important rule. **Do not** use selectors that are subject to change, like CSS classes, IDs, or tag names. Instead, add dedicated test attributes to your HTML.

  * **Why?** It decouples your tests from styling and implementation details. A developer can refactor CSS or change a `<div>` to a `<section>` without breaking your tests. Your tests will only break when the core functionality is actually removed or changed.
  * **How?** Use a `data-*` attribute like `data-cy`, `data-testid`, or `data-test`.

**Bad Practice 👎**

```javascript
// This test will break if a designer changes the button's class
cy.get('.btn.btn-primary.submit-login').click();
```

**Good Practice 👍**

```javascript
// In your HTML: <button data-cy="login-submit-button">Log In</button>

// In your test:
cy.get('[data-cy="login-submit-button"]').click();
```

-----

### \#\# 2. Don't Use the UI to Log In for Every Test

Tests that require an authenticated user shouldn't go through the login form every single time. It's slow and adds unnecessary points of failure.

  * **Why?** It dramatically speeds up your test suite. You're testing the feature on the page, not the login functionality over and over again.
  * **How?** Use `cy.request()` to send a `POST` request directly to your login API endpoint. Then, you can store the session token in local storage or a cookie, just like your application does. This is best placed inside a custom command.

**Good Practice 👍**

```javascript
// In cypress/support/commands.js
Cypress.Commands.add('login', (email, password) => {
  cy.request('POST', '/api/login', { email, password })
    .then((response) => {
      // Assuming the API returns a token that you set in localStorage
      window.localStorage.setItem('authToken', response.body.token);
    });
});

// In your test file
describe('User Dashboard', () => {
  beforeEach(() => {
    // Log in programmatically before each test in this suite
    cy.login('test@user.com', 'password123');
    cy.visit('/dashboard');
  });

  it('should display the user name', () => {
    cy.contains('h1', 'Welcome, test@user.com');
  });
});
```

-----

### \#\# 3. Avoid Arbitrary Waits

Never use `cy.wait()` with a number (`cy.wait(5000)`). This is an anti-pattern that leads to flaky tests.

  * **Why?** If you wait for a fixed time, your test will either be too slow (if the app is fast) or fail randomly (if the app is slow). Cypress is designed to automatically wait for elements and requests. You just need to tell it *what* to wait for.
  * **How?** Rely on Cypress's built-in retry-ability. When you command Cypress to interact with an element or make an assertion, it will automatically wait for that condition to be met before timing out. For network requests, use `cy.intercept()` and wait on the alias.

**Bad Practice 👎**

```javascript
cy.get('[data-cy="submit-button"]').click();
// Hope that 2 seconds is enough for the API call to finish...
cy.wait(2000);
cy.contains('Success!').should('be.visible');
```

**Good Practice 👍**

```javascript
// Intercept the network request and give it an alias
cy.intercept('POST', '/api/form').as('formSubmission');

cy.get('[data-cy="submit-button"]').click();

// Explicitly wait for the aliased network request to complete
cy.wait('@formSubmission');

// Now, make your assertion. Cypress will retry until the element appears.
cy.contains('Success!').should('be.visible');
```

-----

### \#\# 4. Keep Your Tests Independent

Each test (`it(...)` block) should be able to run independently and in any order. A test should not rely on the state created by a previous test.

  * **Why?** It makes tests easier to debug and run in isolation. If one test fails, it won't cascade and cause other, unrelated tests to fail.
  * **How?** Use `beforeEach()` or `before()` hooks to set up the necessary state for your tests. Cypress automatically cleans up the browser state (like cookies and local storage) between tests, which helps enforce this.

**Bad Practice 👎**

```javascript
describe('Item Management', () => {
  it('creates a new item', () => {
    // This test creates state that the next test depends on
    cy.visit('/items/new');
    cy.get('[data-cy="item-name"]').type('My New Item');
    cy.get('[data-cy="save-item"]').click();
    cy.url().should('include', '/items');
  });

  it('deletes the item', () => {
    // This test will fail if the 'creates a new item' test fails or doesn't run first
    cy.get('[data-cy="delete-item-My New Item"]').click();
    cy.contains('My New Item').should('not.exist');
  });
});
```

**Good Practice 👍**

```javascript
describe('Item Management', () => {
  beforeEach(() => {
    // Create the necessary item before each test using an API call
    cy.request('POST', '/api/items', { name: 'My Test Item' });
    cy.visit('/items');
  });

  it('can view the created item', () => {
    cy.contains('My Test Item').should('be.visible');
  });

  it('can delete the created item', () => {
    cy.get('[data-cy="delete-item-My Test Item"]').click();
    cy.contains('My Test Item').should('not.exist');
  });
});
```

By following these rules, you'll build a test suite that is robust, fast, and a genuine asset to your project's development lifecycle. 🚀