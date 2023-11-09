import { stubMutation, stubQuery } from "../utils/graphql";

const firstname1 = "John";
const firstname2 = "John 2";

const lastname1 = "Doe";
const lastname2 = "Doe 2";

const email1 = "email@example.com";
const email2 = "email2@example.com";

const phone1 = "06 01 02 03 04";
const phone2 = "06 01 02 03 05";

context("Candidate account", () => {
  it("update all account information", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate1.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(req, "update_contact", "contact.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="project-home-update-contact"]').click();

    cy.get("[name=firstname]").should("have.value", firstname1);
    cy.get("[name=lastname]").should("have.value", lastname1);
    cy.get("[name=phone]").should("have.value", phone1);
    cy.get("[name=email]").should("have.value", email1);

    cy.get("[name=firstname]").type(`{selectAll}${firstname2}`);
    cy.get("[name=lastname]").type(`{selectAll}${lastname2}`);
    cy.get("[name=phone]").type(`{selectAll}${phone2}`);
    cy.get("[name=email]").type(`{selectAll}${email2}`);

    cy.get('[data-test="project-contact-save"]').click();
    cy.wait("@update_contact");

    cy.get('[data-test="project-home-fullname"]').contains(
      `${firstname2} ${lastname2}`
    );
    cy.get('[data-test="project-home-contact-phone"]').contains(phone2);
    cy.get('[data-test="project-home-contact-email"]').contains(email2);

    cy.get('[data-test="project-home-update-contact"]').click();

    cy.get("[name=firstname]").should("have.value", firstname2);
    cy.get("[name=lastname]").should("have.value", lastname2);
    cy.get("[name=phone]").should("have.value", phone2);
    cy.get("[name=email]").should("have.value", email2);
  });
});
