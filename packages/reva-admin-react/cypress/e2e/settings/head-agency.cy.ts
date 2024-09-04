import { stubQuery } from "../../utils/graphql";
import { StatutValidationInformationsJuridiquesMaisonMereAap } from "@/graphql/generated/graphql";

function visitSettings({
  informationsJuridiques,
}: {
  informationsJuridiques: StatutValidationInformationsJuridiquesMaisonMereAap;
}) {
  cy.fixture("account/agencies-settings.json").then((settings) => {
    settings.data.account_getAccountForConnectedUser.organism.maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP =
      informationsJuridiques;

    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "activeFeaturesForConnectedUser",
        "features/active-features.json",
      );
      stubQuery(
        req,
        "getOrganismForAAPVisibilityCheck",
        "visibility/organism.json",
      );
      stubQuery(req, "getAgenciesSettingsInfo", settings);
      stubQuery(req, "getAccountInfo", "account/head-agency-info.json");
      stubQuery(
        req,
        "getMaisonMereCGUQuery",
        "account/head-agency-cgu-new.json",
      );
    });
  });

  cy.headAgency("/agencies-settings-v3/");
}

context("Head agency settings page", () => {
  context("on the general information section", () => {
    it("display a 'to complete badge' when account not verified", function () {
      visitSettings({
        informationsJuridiques: "A_METTRE_A_JOUR",
      });
      cy.wait("@getAgenciesSettingsInfo");
      cy.get(
        '[data-test="general-information"] [data-test="to-complete-badge"]',
      ).should("exist");
    });

    it("display a 'completed badge' when account verification is pending", function () {
      visitSettings({
        informationsJuridiques: "EN_ATTENTE_DE_VERIFICATION",
      });
      cy.wait("@getAgenciesSettingsInfo");
      cy.get(
        '[data-test="general-information"] [data-test="completed-badge"]',
      ).should("exist");
    });

    it("display a 'completed badge' when account is up to date", function () {
      visitSettings({
        informationsJuridiques: "A_JOUR",
      });
      cy.wait("@getAgenciesSettingsInfo");
      cy.get(
        '[data-test="general-information"] [data-test="completed-badge"]',
      ).should("exist");
    });
  });

  it("should display remote and user account list section and no on-site section", function () {
    visitSettings({ informationsJuridiques: "A_JOUR" });
    cy.wait("@getAgenciesSettingsInfo");
    cy.get('[data-test="remote-agency"]').should("exist");
    cy.get('[data-test="on-site-agencies"]').should("exist");
    cy.get('[data-test="on-site-agency"]').should("not.exist");
  });
});
