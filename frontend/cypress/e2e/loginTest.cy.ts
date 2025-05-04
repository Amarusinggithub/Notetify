const loginPassword = Cypress.env("LOGIN_PASSWORD");
const loginEmail = Cypress.env("LOGIN_EMAIL");



beforeEach(() => {
  cy.intercept("GET", "/csrf/", { statusCode: 204 }).as("getCsrf");
  cy.intercept("POST", "/api/login/", {
    statusCode: 200,
    body: { success: true },
  }).as("doLogin");
  cy.intercept("GET", "/auth/me/", {
    statusCode: 200,
    body: { },
  }).as("getMe");
  cy.intercept("GET", "/api/notes/", {
    statusCode: 200,
    body: [{ id: "n1", title: "Test", isPinned: true }],
  }).as("getNotes");
  cy.intercept("GET", "/api/tags/", { statusCode: 200,  }).as(
    "getTags"
  );

    cy.visit("http://localhost:5173/login");
    cy.wait("@getCsrf");
});

describe("Authentication flow", () => {
  it("should log in and show pinned notes", () => {
    
    cy.get('[data-testid="cypress-Login-Email-input"]').type(loginEmail);
    cy.get('[data-testid="cypress-Login-Password-input"]').type(loginPassword);
    cy.get('[data-testid="cypress-Login-btn"]').click();

    cy.wait("@doLogin").its("response.statusCode").should("eq", 200);
    cy.wait("@getMe");
    cy.wait("@getNotes");
    cy.wait("@getTags");

    cy.location("pathname").should("equal", "/");
    cy.get('[data-testid="cypress-pinnedNotes-title"]').should("exist");
  });
});