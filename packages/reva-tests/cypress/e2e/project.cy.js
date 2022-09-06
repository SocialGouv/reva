context("Project", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3001");
  });

  it("attempt to validate project", function () {
    cy.get("#select_region").select("11");
    cy.get(
      '[data-test="certification-select-9a3a514d-4216-45b9-b5cb-13b40a79c7e3"] > .items-end'
    ).click();
    cy.get('[data-test="certification-submit"]').click();
    cy.get('[data-test="submission-home-show-project-home"]').click();
    cy.get('[data-test="project-home-validate-locked"]').click();
    cy.get('[data-test="project-help"]').should("exist");
    cy.get('[data-test="project-help"] > [data-test="button-back"]').click();
    cy.get('[data-test="project-home"]').should("exist");
  });
});
