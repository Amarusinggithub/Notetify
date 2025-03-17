const loginPassword = Cypress.env("LOGIN_PASSWORD");

describe("this is a test to test authentication", () => {
  it("tests the login", () => {
    cy.visit("http://localhost:5173/");
    cy.get('[data-testid="cypress-Login-title"]').should("exist");
    cy.get('[data-testid="cypress-Login-UserName-input"]').type("Amar");
    cy.get('[data-testid="cypress-Login-Password-input"]').type(
      `${loginPassword}`
    );
    cy.get('[data-testid="cypress-Login-btn"]').click();
    cy.get('[data-testid="cypress-Login-form"]').submit();
    cy.get('[data-testid="cypress-pinnedNotes-title"]').should("exist");
  });
});
