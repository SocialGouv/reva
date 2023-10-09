export {};
describe("candidate registration confirmation", () => {
  it("should redirect to the homepage when i click the OK button", () => {
    cy.visit("http://localhost:3002/inscription-candidat/confirmation");

    cy.get('[data-testid="ok-button"]').click();

    cy.url().should("eq", "http://localhost:3002/");
  });
});
