context("Project", () => {
  it("attempt to validate project", function () {
    cy.intercept('/graphql', { fixture: 'getCandidacy' }).as('getCandidacy')
    cy.visit("/");

    cy.intercept('/graphql', { fixture: 'certifications' }).as('certifications')
    cy.get("#select_region").select("11");

    cy.intercept('/graphql', { fixture: 'getCertification' }).as('getCertification')
    cy.get('[data-test="results"] [data-type="card"]').eq(4).click();

    cy.intercept('/graphql', { fixture: 'createCandidacy' }).as('createCandidacy')
    cy.get('[data-test="certification-submit"]').click();

    cy.get('[data-test="submission-home-show-project-home"]').click();
    cy.get('[data-test="project-home-validate-locked"]').click();
    cy.get('[data-test="project-help"]').should("exist");
    cy.get('[data-test="project-help"] > [data-test="button-back"]').click();
    cy.get('[data-test="project-home"]').should("exist");
  });
});
