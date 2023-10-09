import { stubQuery } from "../support/graphql";

describe("candidate registration", () => {
  it("should show the certificate selected in the previous screen", () => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getCertification", "certification_bts_chaudronnier.json");
    });

    cy.visit(
      "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0"
    );

    cy.wait("@getCertification");

    cy.get('[data-testid="selected-certificate-label"]').should(
      "have.text",
      "BTS Chaudronnier"
    );
    cy.get('[data-testid="selected-certificate-code-rncp"]').should(
      "have.text",
      "RNCP123"
    );
    cy.get('[data-testid="selected-certificate-type-diplome"]').should(
      "have.text",
      "Titre-BTS"
    );
  });

  it("should have an empty candidate typology at page load", () => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getCertification", "certification_bts_chaudronnier.json");
    });

    cy.visit(
      "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0"
    );

    cy.wait("@getCertification");

    cy.get('[data-testid="candidate-typology-select"]')
      .children("select")
      .should("have.value", null);
  });

  it("should show an error panel when i select a candidate typology of 'SALARIE_PUBLIC' or 'AUTRE'", () => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getCertification", "certification_bts_chaudronnier.json");
    });

    cy.visit(
      "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0"
    );

    cy.wait("@getCertification");

    cy.get('[data-testid="candidate-typology-select"]')
      .children("select")
      .select("SALARIE_PUBLIC");

    cy.get('[data-testid="candidate-typology-error-panel"]').should(
      "have.text",
      "Le parcours VAE sur vae.gouv.fr n'est pas encore disponible dans votre situation. Dirigez-vous vers vae.centre-inffo.fr"
    );

    cy.get('[data-testid="candidate-typology-select"]')
      .children("select")
      .select("AUTRE");

    cy.get('[data-testid="candidate-typology-error-panel"]').should(
      "have.text",
      "Prenez rendez-vous avec un conseiller près de chez vous pour être orienté."
    );
  });

  it("should show 'would you like to know more ?' panel when i select a candidate typology of 'SALARIE_PUBLIC' or 'AUTRE'", () => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "getCertification", "certification_bts_chaudronnier.json");
    });

    cy.visit(
      "http://localhost:3002/inscription-candidat/?certificationId=7ad608c2-5a4b-40eb-8ef9-7a85421b40f0"
    );

    cy.wait("@getCertification");

    cy.get('[data-testid="candidate-typology-select"]')
      .children("select")
      .select("SALARIE_PUBLIC");

    cy.get(
      '[data-testid="candidate-typology-would-you-like-to-know-more-panel"]'
    ).should("exist");

    cy.get('[data-testid="candidate-typology-select"]')
      .children("select")
      .select("AUTRE");

    cy.get(
      '[data-testid="candidate-typology-would-you-like-to-know-more-panel"]'
    ).should("exist");
  });
});
