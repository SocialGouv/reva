import { setDeviceId } from "../utils/device";
import { stubQuery } from "../utils/graphql";

const email = "email@example.com";

const phone1 = "06-01-02-03-04";
const phone2 = "06-01-02-03-05";

context("Contact", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.intercept("POST", "http://localhost:8080/graphql", (req) => {
      stubQuery(req, "getCandidacy");
    });
    // setDeviceId();
  });

  it("add and edit an experience", function () {
    cy.wait("@getCandidacy");
    cy.get('[data-test="submission-home-show-project-home"]').click();
    cy.get('[data-test="project-home-edit-contact"]').click();
    cy.get("#phone").type(phone1);
    cy.get('[data-test="project-contact-save"]').click();

    cy.get('[data-test="project-home-contact-phone"]').should(
      "have.text",
      phone1
    );

    cy.get('[data-test="project-home-edit-contact"]').click();

    cy.get("#phone").type(`{selectAll}${phone2}`);
    cy.get("#email").type(email);

    cy.get('[data-test="project-contact-save"]').click();

    cy.get('[data-test="project-home-contact-phone"]').should(
      "have.text",
      phone2
    );
    cy.get('[data-test="project-home-contact-email"]').should(
      "have.text",
      email
    );

    cy.get('[data-test="progress-title-value"]').should("have.text", "40%");
  });
});
