import { stubMutation, stubQuery } from "../../utils/graphql";

function setupCommonGestionnaireIntercepts() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(
      req,
      "getMaisonMereCGUQuery",
      "account/gestionnaire-cgu-accepted.json",
    );
    stubQuery(
      req,
      "activeFeaturesForConnectedUser",
      "features/active-features.json",
    );
    stubQuery(req, "getAccountInfo", "account/gestionnaire-info.json");
    stubQuery(req, "getGestionnaireMaisonMerAAPOrganismInfoQuery", {
      data: {
        account_getAccountForConnectedUser: {
          organism: {
            contactAdministrativeEmail: "admin@example.com",
            contactAdministrativePhone: "0123456789",
          },
        },
      },
    });
  });
}

function visitAddLieuAccueil() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubMutation(req, "createLieuAccueilInfoMutationForAddAgencePage", {
      data: {
        organism_createLieuAccueilInfo: "new-organism-id",
      },
    });
  });

  setupCommonGestionnaireIntercepts();

  cy.gestionnaire(
    "/agencies-settings-v3/733540e0-1bb1-4b8d-a66d-97fc992ff522/organisms/add-agency/",
  );

  cy.wait([
    "@getAccountInfo",
    "@getMaisonMereCGUQuery",
    "@activeFeaturesForConnectedUser",
    "@getGestionnaireMaisonMerAAPOrganismInfoQuery",
  ]);
}

function visitUpdateOrganismInformation() {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(req, "getOrganismForInformationOnSitePage", {
      data: {
        organism_getOrganism: {
          id: "b162e2fc-f640-4802-8808-45b99689b671",
          label: "Mon lieu d'accueil",
          nomPublic: "Nom affiché",
          telephone: "0650505050",
          siteInternet: "https://example.com",
          emailContact: "test@example.com",
          adresseNumeroEtNomDeRue: "4 Rue de la Tour du Pin",
          adresseInformationsComplementaires: "",
          adresseCodePostal: "33000",
          adresseVille: "Bordeaux",
          conformeNormesAccessibilite: "CONFORME",
          maisonMereAAP: {
            raisonSociale: "Raison Sociale Example",
          },
        },
      },
    });
    stubMutation(
      req,
      "createOrUpdateOnSiteOrganismGeneralInformationMutation",
      {
        data: {
          organism_createOrUpdateOnSiteOrganismGeneralInformation: {
            id: "b162e2fc-f640-4802-8808-45b99689b671",
          },
        },
      },
    );
  }).as("graphql");

  setupCommonGestionnaireIntercepts();

  cy.gestionnaire(
    "/agencies-settings-v3/733540e0-1bb1-4b8d-a66d-97fc992ff522/organisms/b162e2fc-f640-4802-8808-45b99689b671/on-site/information/",
  );

  cy.wait([
    "@getOrganismForInformationOnSitePage",
    "@getAccountInfo",
    "@getMaisonMereCGUQuery",
    "@activeFeaturesForConnectedUser",
  ]);
}

describe("Organism Information Form with Address Autocomplete", () => {
  context("Creating a new lieu d'accueil", () => {
    beforeEach(() => {
      cy.intercept("GET", "https://api-adresse.data.gouv.fr/search/*", {
        fixture: "address/search-results.json",
      }).as("addressSearch");
    });

    it("should display autocomplete suggestions and fill complete address", () => {
      visitAddLieuAccueil();

      cy.get('input[name="adresseComplete"]').type("10 Rue de la");

      cy.wait("@addressSearch");

      cy.get('[data-testid="autocomplete-options"] > div')
        .should("have.length", 3)
        .first()
        .should("contain", "10 Rue de la Paix 75002 Paris");
    });

    it("should fill the complete address field when selecting an autocomplete option", () => {
      visitAddLieuAccueil();

      cy.get('input[name="adresseComplete"]').type("10 Rue de la");
      cy.wait("@addressSearch");

      cy.get('[data-testid="autocomplete-options"] > div').first().click();

      cy.get('input[name="adresseComplete"]').should(
        "have.value",
        "10 Rue de la Paix 75002 Paris",
      );
    });

    it("should submit the form with split address parts to API", () => {
      visitAddLieuAccueil();

      cy.get('input[name="nomPublic"]').type("Mon nouveau lieu");
      cy.get('input[name="adresseComplete"]').type("10 Rue de la");
      cy.wait("@addressSearch");
      cy.get('[data-testid="autocomplete-options"] > div').first().click();

      cy.get('input[name="telephone"]').type("0123456789");
      cy.get('input[name="emailContact"]').type("test@example.com");
      cy.get('input[value="CONFORME"]').check({ force: true });

      cy.get('button[type="submit"]').click();

      cy.wait("@createLieuAccueilInfoMutationForAddAgencePage").then(
        (interception) => {
          const variables = interception.request.body.variables;
          expect(variables.data.adresseNumeroEtNomDeRue).to.equal(
            "10 Rue de la Paix",
          );
          expect(variables.data.adresseCodePostal).to.equal("75002");
          expect(variables.data.adresseVille).to.equal("Paris");
        },
      );
    });

    it("should show validation error if no address is selected from autocomplete", () => {
      visitAddLieuAccueil();

      cy.get('input[name="nomPublic"]').type("Mon nouveau lieu");
      cy.get('input[name="adresseComplete"]').type("Adresse manuelle");
      cy.get('input[name="telephone"]').type("0123456789");
      cy.get('input[name="emailContact"]').type("test@example.com");
      cy.get('input[value="CONFORME"]').check({ force: true });

      cy.get('button[type="submit"]').click();

      cy.contains("Veuillez saisir puis sélectionner une adresse.").should(
        "be.visible",
      );
    });
  });

  context("Updating an existing organism", () => {
    beforeEach(() => {
      cy.intercept("GET", "https://api-adresse.data.gouv.fr/search/*", {
        fixture: "address/search-results.json",
      }).as("addressSearch");
    });

    it("should display existing address as complete address in the field", () => {
      visitUpdateOrganismInformation();

      cy.get('input[name="adresseComplete"]', { timeout: 10000 }).should(
        "have.value",
        "4 Rue de la Tour du Pin 33000 Bordeaux",
      );
    });

    it("should update address with new autocomplete selection", () => {
      visitUpdateOrganismInformation();

      cy.get('input[name="adresseComplete"]', { timeout: 10000 })
        .clear()
        .type("20 Avenue");
      cy.wait("@addressSearch");
      cy.get('[data-testid="autocomplete-options"] > div')
        .contains("20 Avenue des Champs-Élysées 75008 Paris")
        .click();

      cy.get('input[name="adresseComplete"]').should(
        "have.value",
        "20 Avenue des Champs-Élysées 75008 Paris",
      );

      cy.get('button[type="submit"]').click();

      cy.wait("@createOrUpdateOnSiteOrganismGeneralInformationMutation").then(
        (interception) => {
          const variables = interception.request.body.variables;
          expect(
            variables.informationsCommerciales.adresseNumeroEtNomDeRue,
          ).to.equal("20 Avenue des Champs-Élysées");
          expect(variables.informationsCommerciales.adresseCodePostal).to.equal(
            "75008",
          );
          expect(variables.informationsCommerciales.adresseVille).to.equal(
            "Paris",
          );
        },
      );
    });

    it("should allow updating other fields without requiring address reselection", () => {
      visitUpdateOrganismInformation();

      cy.get('input[name="siteInternet"]', { timeout: 10000 })
        .clear()
        .type("https://other-example.com");

      cy.get('button[type="submit"]').click();

      cy.contains("Veuillez saisir puis sélectionner une adresse.").should(
        "not.exist",
      );

      cy.wait("@createOrUpdateOnSiteOrganismGeneralInformationMutation").then(
        (interception) => {
          const variables = interception.request.body.variables;
          expect(
            variables.informationsCommerciales.adresseNumeroEtNomDeRue,
          ).to.equal("4 Rue de la Tour du Pin");
          expect(variables.informationsCommerciales.adresseCodePostal).to.equal(
            "33000",
          );
          expect(variables.informationsCommerciales.adresseVille).to.equal(
            "Bordeaux",
          );
          expect(variables.informationsCommerciales.siteInternet).to.equal(
            "https://other-example.com",
          );
        },
      );
    });
  });
});
