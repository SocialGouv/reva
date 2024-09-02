import { stubQuery } from "../../utils/graphql";
import { StatutValidationInformationsJuridiquesMaisonMereAap } from "@/graphql/generated/graphql";

function visitSettings({
  isRemote,
  isOnSite,
}: {
  isRemote: boolean;
  isOnSite: boolean;
}) {
  cy.fixture("account/agencies-settings.json").then((settings) => {
    settings.data.account_getAccountForConnectedUser.organism.isRemote =
      isRemote;
    settings.data.account_getAccountForConnectedUser.organism.isOnSite =
      isOnSite;

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
      stubQuery(req, "getAccountInfo", "account/agency-info.json");
      stubQuery(req, "getMaisonMereCGUQuery", "account/head-agency-cgu.json");
    });
  });

  cy.agency("/agencies-settings-v3/");
}

context("Agency settings page", () => {
  it("should not display a general information block", function () {
    visitSettings({ isRemote: true, isOnSite: false });
    cy.wait("@getAgenciesSettingsInfo");
    // Make  sure the page is ready before checking non-existence of the general information block
    cy.get('[data-test="remote-agency"]').should("exist");
    cy.get('[data-test="general-information"]').should("not.exist");
  });

  context("for a remote agency", () => {
    it("should display a remote block and no on-site block", function () {
      visitSettings({ isRemote: true, isOnSite: false });
      cy.wait("@getAgenciesSettingsInfo");
      cy.get('[data-test="remote-agency"]').should("exist");
      cy.get('[data-test="on-site-agency"]').should("not.exist");
      cy.get('[data-test="on-site-agencies"]').should("not.exist");
    });
  });

  context("for an on-site agency", () => {
    it("should display a on-site block and no remote block", function () {
      visitSettings({ isRemote: false, isOnSite: true });
      cy.wait("@getAgenciesSettingsInfo");
      cy.get('[data-test="on-site-agency"]').should("exist");
      cy.get('[data-test="remote-agency"]').should("not.exist");
      cy.get('[data-test="on-site-agencies"]').should("not.exist");
    });
  });
});
