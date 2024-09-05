import { stubQuery } from "../../utils/graphql";
import { StatutValidationInformationsJuridiquesMaisonMereAap } from "@/graphql/generated/graphql";

function visitSettings({
  informationsJuridiques,
}: {
  informationsJuridiques: StatutValidationInformationsJuridiquesMaisonMereAap;
}) {
  cy.fixture("account/head-agency-settings.json").then((settings) => {
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
      stubQuery(req, "getHeadAgencySettingsInfo", settings);
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
      cy.wait("@getHeadAgencySettingsInfo");
      cy.get(
        '[data-test="general-information"] [data-test="to-complete-badge"]',
      ).should("exist");
    });

    it("display a 'completed badge' when account verification is pending", function () {
      visitSettings({
        informationsJuridiques: "EN_ATTENTE_DE_VERIFICATION",
      });
      cy.wait("@getHeadAgencySettingsInfo");
      cy.get(
        '[data-test="general-information"] [data-test="completed-badge"]',
      ).should("exist");
    });

    it("display a 'completed badge' when account is up to date", function () {
      visitSettings({
        informationsJuridiques: "A_JOUR",
      });
      cy.wait("@getHeadAgencySettingsInfo");
      cy.get(
        '[data-test="general-information"] [data-test="completed-badge"]',
      ).should("exist");
    });
  });

  it("should display remote and user account list section and no on-site section", function () {
    visitSettings({ informationsJuridiques: "A_JOUR" });
    cy.wait("@getHeadAgencySettingsInfo");
    cy.get('[data-test="remote-agency"]').should("exist");
    cy.get('[data-test="on-site-agencies"]').should("exist");
    cy.get('[data-test="on-site-agency"]').should("not.exist");
  });

  context("on the account list section", () => {
    it("the add button should be disabled when the head account is not verified", function () {
      visitSettings({ informationsJuridiques: "A_METTRE_A_JOUR" });
      cy.wait("@getHeadAgencySettingsInfo");
      cy.get('[data-test="user-accounts"] [data-test="action-button"]').should(
        "be.disabled",
      );
    });

    it("the add button should be enabled when the head account is up to date", function () {
      visitSettings({ informationsJuridiques: "A_JOUR" });
      cy.wait("@getHeadAgencySettingsInfo");
      cy.get('[data-test="user-accounts"] [data-test="action-button"]').should(
        "be.enabled",
      );
    });

    it("display all accounts, except the head agency account, with info details", function () {
      visitSettings({ informationsJuridiques: "A_JOUR" });
      cy.wait("@getHeadAgencySettingsInfo");
      cy.get('[data-test="user-accounts"] li').should("have.length", 3);
      cy.get(
        '[data-test="user-accounts"] [data-test="account-2"] [data-test="on-site-badge"]',
      ).should("exist");
      cy.get('[data-test="user-accounts"] [data-test="account-3"]').should(
        "contain",
        "Catherine Doe",
      );
      cy.get('[data-test="user-accounts"] [data-test="account-4"]').should(
        "contain",
        "bob.doe@example.com",
      );
    });
  });
});
