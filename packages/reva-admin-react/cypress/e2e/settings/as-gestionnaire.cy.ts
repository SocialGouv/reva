import { StatutValidationInformationsJuridiquesMaisonMereAap } from "@/graphql/generated/graphql";

import { stubQuery } from "../../utils/graphql";

function visitSettings({
  informationsJuridiques = "A_JOUR",
  isMCFCompatible = null,
}: {
  informationsJuridiques?: StatutValidationInformationsJuridiquesMaisonMereAap;
  isMCFCompatible?: boolean | null;
}) {
  cy.fixture("account/gestionnaire-settings.json").then((settings) => {
    settings.data.account_getAccountForConnectedUser.organisms[0].maisonMereAAP.statutValidationInformationsJuridiquesMaisonMereAAP =
      informationsJuridiques;
    settings.data.account_getAccountForConnectedUser.organisms[0].maisonMereAAP.isMCFCompatible =
      isMCFCompatible;
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
      stubQuery(req, "getGestionnaireMaisonMereAAPSettingsInfo", settings);
      stubQuery(req, "getAccountInfo", "account/gestionnaire-info.json");
      stubQuery(
        req,
        "getMaisonMereCGUQuery",
        "account/gestionnaire-cgu-new.json",
      );
    });
  });

  cy.gestionnaire("/agencies-settings-v3/");
}

context("Gestionnaire AAP settings page", () => {
  context("on the general information section", () => {
    it("display a 'to complete badge' when account not verified", function () {
      visitSettings({
        informationsJuridiques: "A_METTRE_A_JOUR",
      });
      cy.wait("@getGestionnaireMaisonMereAAPSettingsInfo");
      cy.get(
        '[data-testid="general-information"] [data-testid="to-complete-badge"]',
      ).should("exist");
    });

    it("display a 'completed badge' when account verification is pending", function () {
      visitSettings({
        informationsJuridiques: "EN_ATTENTE_DE_VERIFICATION",
      });
      cy.wait("@getGestionnaireMaisonMereAAPSettingsInfo");
      cy.get(
        '[data-testid="general-information"] [data-testid="completed-badge"]',
      ).should("exist");
    });

    it("display a 'completed badge' when account is up to date", function () {
      visitSettings({
        informationsJuridiques: "A_JOUR",
      });
      cy.wait("@getGestionnaireMaisonMereAAPSettingsInfo");
      cy.get(
        '[data-testid="general-information"] [data-testid="completed-badge"]',
      ).should("exist");
    });
  });

  it("should display remote and user account list section and no on-site section", function () {
    visitSettings({ informationsJuridiques: "A_JOUR" });
    cy.wait("@getGestionnaireMaisonMereAAPSettingsInfo");
    cy.get('[data-testid="remote-organism"]').should("exist");
    cy.get('[data-testid="on-site-organisms"]').should("exist");
    cy.get('[data-testid="on-site-organism"]').should("not.exist");
  });

  context("on the account list section", () => {
    it("the add button should be disabled when the gestionnaire aap account is not verified", function () {
      visitSettings({ informationsJuridiques: "A_METTRE_A_JOUR" });
      cy.wait("@getGestionnaireMaisonMereAAPSettingsInfo");
      cy.get(
        '[data-testid="user-accounts"] [data-testid="action-button"]',
      ).should("be.disabled");
    });

    it("the add button should be enabled when the gestionnaire aap account is up to date", function () {
      visitSettings({ informationsJuridiques: "A_JOUR" });
      cy.wait("@getGestionnaireMaisonMereAAPSettingsInfo");
      cy.get(
        '[data-testid="user-accounts"] [data-testid="action-button"]',
      ).should("be.enabled");
    });

    it("display all accounts, except the gestionnaire aap account, with info details", function () {
      visitSettings({ informationsJuridiques: "A_JOUR" });
      cy.wait("@getGestionnaireMaisonMereAAPSettingsInfo");
      cy.get('[data-testid="user-accounts"] li').should("have.length", 3);
      cy.get(
        '[data-testid="user-accounts"] [data-testid="account-2"] [data-testid="on-site-badge"]',
      ).should("exist");
      cy.get('[data-testid="user-accounts"] [data-testid="account-3"]').should(
        "contain",
        "Catherine Doe",
      );
      cy.get('[data-testid="user-accounts"] [data-testid="account-4"]').should(
        "contain",
        "bob.doe@example.com",
      );
    });
  });

  context("on the financing methods section", () => {
    it("display a 'to complete badge' when we don't know if the AAP is MCP compatible or not", function () {
      visitSettings({});
      cy.wait("@getGestionnaireMaisonMereAAPSettingsInfo");
      cy.get(
        '[data-testid="financing-methods"] [data-testid="to-complete-badge"]',
      ).should("exist");
      cy.get(
        '[data-testid="financing-methods"] [data-testid="no-financing-method-text"]',
      ).should(
        "contain.text",
        "Vous êtes référencé sur la plateforme Mon Compte Formation ? Faites-le faire savoir aux candidats afin qu’ils puissent financer l’accompagnement via ce dispositif.",
      );
    });
    it("display a 'completed badge' when the AAP is MCP compatible ", function () {
      visitSettings({ isMCFCompatible: true });
      cy.wait("@getGestionnaireMaisonMereAAPSettingsInfo");
      cy.get(
        '[data-testid="financing-methods"] [data-testid="completed-badge"]',
      ).should("exist");
      cy.get(
        '[data-testid="financing-methods"] [data-testid="financing-methods-text"]',
      ).should("contain.text", "Référencé Mon Compte Formation");
    });
    it("display a 'completed badge' when the AAP is not MCP compatible ", function () {
      visitSettings({ isMCFCompatible: false });
      cy.wait("@getGestionnaireMaisonMereAAPSettingsInfo");
      cy.get(
        '[data-testid="financing-methods"] [data-testid="completed-badge"]',
      ).should("exist");
      cy.get(
        '[data-testid="financing-methods"] [data-testid="financing-methods-text"]',
      ).should("contain.text", "Non-référencé Mon Compte Formation");
    });
  });
});
