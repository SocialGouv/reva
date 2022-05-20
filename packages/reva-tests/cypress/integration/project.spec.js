context("Project", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3001");
  });

  it("attempt to validate project", function () {
    cy.get(
      '[data-test="certification-select-87c7f384-70b0-4a6c-945c-6c4cc1e433c7"]'
    ).click();
    cy.get('[data-test="certification-submit"]').click();
    cy.get('[data-test="submission-home-show-project-home"]').click();
    cy.get('[data-test="project-home-validate-locked"]').click();
    cy.get('[data-test="project-help"]').should("exist");
    cy.get('[data-test="button-back"]').click();
    cy.get('[data-test="project-home"]').should("exist");
  });
});
