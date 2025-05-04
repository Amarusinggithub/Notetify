

beforeEach(() => {
  // stub CSRF fetch
  cy.intercept("GET", "/csrf/", { statusCode: 204 }).as("getCsrf");

  cy.intercept("GET", "/auth/me/", {
    statusCode: 200,
    body: { },
  }).as("getMe");

  cy.intercept("GET", "/api/tags/", {
    statusCode: 200,
  }).as("getTags");

  cy.intercept("GET", "/api/notes/", {
    statusCode: 200,
  }).as("getNotes");
});

describe("this is a test to test data fetching", () => {
  it("tests the data fetching", () => {
    cy.visit("http://localhost:5173/");
    cy.location("pathname").should("equal", "/");

    cy.wait("@getNotes").its("response.statusCode").should("eq", 200);
    cy.wait("@getTags").its("response.statusCode").should("eq", 200);

    cy.location("pathname").should("equal", "/");

    cy.get('[data-testid="cypress-pinnedNotes-title"]').should("exist");
  });
});
