const experienceTitle1 = "Assistante de vie aux familles";
const experienceTitle2 = "Auxiliaire de vie sociale";

const experienceDescription1 = "Organiser et préparer";
const experienceDescription2 =
  "Organiser et préparer les tâches de planification des membres de la famille";

context("Experiences", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3001");
  });

  it("add and edit an experience", function () {
    cy.get("#select_region").select("11");
    cy.get('[data-test="certificates"] [data-test="results"]')
      .children()
      .eq(4)
      .click();
    cy.get('[data-test="certification-submit"]').click();
    cy.get('[data-test="submission-home-show-project-home"]').click();
    cy.get('[data-test="project-home-edit-experiences"]').click();
    cy.get('[data-test="project-experiences-add"]').click();
    cy.get("#title").type(experienceTitle1);
    cy.get("#startedAt").type("2019-01-31");
    cy.get("#duration").select("betweenOneAndThreeYears");
    cy.get("#description").type(experienceDescription1);
    cy.get('[data-test="project-experience-add"]').click();

    cy.get('[data-test="project-experiences-overview"] > li')
      .eq(0)
      .within(() => {
        cy.get('[data-test="project-experience-title"]').should(
          "have.text",
          experienceTitle1
        );
        cy.get('[data-test="project-experience-start-date"]').should(
          "have.text",
          "Démarrée en janvier 2019"
        );
        cy.get('[data-test="project-experience-duration"]').should(
          "have.text",
          "Durée d'expérience comprise entre 1 et 3 ans"
        );
        cy.get('[data-test="project-experience-description"]').should(
          "have.text",
          `"${experienceDescription1}"`
        );
      });

    cy.get('[data-test="project-experiences-edit-0"]').click();
    cy.get("#startedAt").type("2017-03-31");
    cy.get("#title").type(`{selectAll}${experienceTitle2}`);
    cy.get("#duration").select("moreThanFiveYears");
    cy.get("#description").type(`{selectAll}${experienceDescription2}`);
    cy.get('[data-test="project-experience-save"]').click();

    cy.get('[data-test="project-experiences-overview"] > li')
      .eq(0)
      .within(() => {
        cy.get('[data-test="project-experience-title"]').should(
          "have.text",
          experienceTitle2
        );
        cy.get('[data-test="project-experience-start-date"]').should(
          "have.text",
          "Démarrée en mars 2017"
        );
        cy.get('[data-test="project-experience-duration"]').should(
          "have.text",
          "Durée d'expérience de plus de 5 ans"
        );
        cy.get('[data-test="project-experience-description"]').should(
          "have.text",
          `"${experienceDescription2}"`
        );
      });

    // We will split this to a separate test once the local storage is done

    cy.get('[data-test="project-experiences-submit"]').click();

    cy.get('[data-test="project-home-experiences"] > li')
      .eq(0)
      .within(() => {
        cy.get('[data-test="project-home-experience-duration"]').should(
          "have.text",
          "Plus de 5 ans"
        );
        cy.get('[data-test="project-home-experience-title"]').should(
          "have.text",
          experienceTitle2
        );
      });

    cy.get('[data-test="progress-title-value"]').should("have.text", "40%");
  });
});
