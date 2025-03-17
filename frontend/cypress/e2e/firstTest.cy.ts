import * as dotenv from "dotenv";
dotenv.config();

const loginPassword = process.env.LOGIN_PASSWORD;

describe("login to website", () => {
  it("passes", () => {
    cy.visit("http://localhost:5173/");
    cy.get('[data-testid="cypress-Login-title"]').should("exist");
    cy.get('[data-testid="cypress-Login-UserName-input"]').type("Amar");
    cy.get('[data-testid="cypress-Login-Password-input"]').type("marilla1871");
    cy.get('[data-testid="cypress-Login-btn"]').click();
    cy.get('[data-testid="cypress-pinnedNotes-title"]').should("exist");
  });
});
