const experienceTitle = "Assistante de vie aux familles";
const experienceDate = "2019-01-31";
const experienceDescription =
  "Organiser et préparer les tâches de planification des membres de la famille";

context("Experiences", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3001");
  });

  it("add an experience", function () {
    cy.get(
      '[data-test="certification-select-ce42ecf4-8277-4400-b9fe-6f9fb6045c11"]'
    ).click();
    cy.get('[data-test="certification-submit"]').click();
    cy.get('[data-test="submission-home-show-project-home"]').click();
    cy.get('[data-test="project-home-edit-experiences"]').click();
    cy.get('[data-test="project-experiences-add"]').click();
    cy.get("#title").type(experienceTitle);
    cy.get("#startDate").type(experienceDate);
    cy.get("#duration").select("moreThanFiveYears");
    cy.get("#description").type(experienceDescription);
    cy.get('[data-test="project-experience-add"]').click();
    cy.get('[data-test="project-experiences-overview"] > li')
      .eq(0)
      .within(() => {
        cy.get('[data-test="project-experience-title"]').should(
          "have.text",
          experienceTitle
        );
        cy.get('[data-test="project-experience-description"]').should(
          "have.text",
          `"${experienceDescription}"`
        );
      });
    cy.get('[data-test="project-experiences-submit"]').click();
  });
});
