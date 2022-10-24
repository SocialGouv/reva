import { stubMutation, stubQuery } from "../utils/graphql";

const firstname = "John";
const lastname = "Doe";

const email1 = "email@example.com";
const email2 = "email2@example.com";

const phone1 = "06-01-02-03-04";
const phone2 = "06-01-02-03-05";

context.skip("Contact", () => {
  it("add a contact", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubQuery(req, "candidate_askForRegistration", "registration.json");
    });
    cy.visit("/");

    cy.get("#firstname").type(firstname);
    cy.get("#lastname").type(lastname);
    cy.get("#email").type(email1);
    cy.get("#phone").type(phone1);

    cy.get('[data-test="project-contact-add"]').click();
    cy.wait("@candidate_askForRegistration");

    cy.get('[data-test="project-contact-confirmation"]');
  });

  it("retrieve contact info from registration", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate1.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "update_contact", "contact2.json");
    });
    cy.visit("/login?token=abc");
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="progress-title-value"]').should("have.text", "20%");

    cy.get('[data-test="project-home-contact-email').contains(email1);
    cy.get('[data-test="project-home-contact-phone').contains(phone1);

    cy.get('[data-test="project-home-edit-contact"]').click();

    cy.get("#firstname").should("have.value", firstname);
    cy.get("#lastname").should("have.value", lastname);
    cy.get("#phone").should("have.value", phone1);
    cy.get("#email").should("have.value", email1);
  });

  it("update email and phone", function () {
    cy.intercept("POST", "/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate1.json");
      stubQuery(req, "getReferential", "referential.json");
      stubQuery(req, "update_contact", "contact.json");
    });
    cy.visit("/login?token=abc");
    cy.wait("@candidate_login");
    cy.wait("@getReferential");

    cy.get('[data-test="project-home-edit-contact"]').click();

    cy.get("#phone").type(`{selectAll}${phone2}`);
    cy.get("#email").type(`{selectAll}${email2}`);

    cy.get('[data-test="project-contact-save"]').click();
    cy.wait("@update_contact");

    cy.get('[data-test="project-home-contact-phone"]').contains(phone2);
    cy.get('[data-test="project-home-contact-email"]').contains(email2);
  });
});
