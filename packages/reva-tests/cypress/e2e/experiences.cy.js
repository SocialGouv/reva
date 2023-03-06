const experienceTitle1 = "Experience 1";
const experienceTitle2 = "Experience 2";

const experienceDescription1 = "Description 1";
const experienceDescription2 = "Description 2";

import { stubMutation, stubQuery } from "../utils/graphql";

context("Experiences", () => {
  it("add and edit an experience", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(
        req,
        "candidate_login",
        "candidate1-certification-and-goals-selected.json"
      );
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "add_experience", "added-experience1.json");
      stubQuery(req, "update_experience", "updated-experience2.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="project-home-edit-experiences"]').click();
    cy.get('[data-test="project-experiences-add"]').click();
    cy.get("[name='title']").type(experienceTitle1);
    cy.get("[name='startedAt']").type("2019-01-31");
    cy.get("[name='duration']").select("betweenOneAndThreeYears");
    cy.get("textarea[name='description']").type(experienceDescription1);

    cy.get('[data-test="project-experience-add"]').click();
    cy.wait("@add_experience");

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
    cy.get("[name='startedAt']").type("2017-03-31");
    cy.get("[name='title']").type(`{selectAll}${experienceTitle2}`);
    cy.get("[name='duration']").select("moreThanFiveYears");
    cy.get("textarea[name='description']").type(
      `{selectAll}${experienceDescription2}`
    );
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
    cy.wait("@update_experience");

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

    cy.get('[data-test="project-home-timeline"]')
      .children("section")
      .eq(2)
      .should("contain.text", experienceTitle2);
  });
});
