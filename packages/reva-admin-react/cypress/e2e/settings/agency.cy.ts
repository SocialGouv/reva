import { stubQuery } from "../../utils/graphql";

function visitSettings({
  isHeadAgency,
  isRemote,
  isOnSite,
  isVisibleInCandidateSearchResults,
}: {
  isHeadAgency: boolean;
  isRemote: boolean;
  isOnSite: boolean;
  isVisibleInCandidateSearchResults: boolean;
}) {
  cy.fixture("account/agency-settings.json").then((settings) => {
    settings.data.account_getAccountForConnectedUser.organism.isHea = isRemote;
    settings.data.account_getAccountForConnectedUser.organism.isOnSite =
      isOnSite;
    settings.data.account_getAccountForConnectedUser.organism.isHeadAgency =
      isHeadAgency;
    settings.data.account_getAccountForConnectedUser.organism.isVisibleInCandidateSearchResults =
      isVisibleInCandidateSearchResults;

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
      stubQuery(req, "getAgencySettingsInfo", settings);
      stubQuery(req, "getAccountInfo", "account/agency-info.json");
      stubQuery(
        req,
        "getMaisonMereCGUQuery",
        "account/head-agency-cgu-new.json",
      );
    });
  });

  cy.agency("/agencies-settings-v3/");
}

context("Agency settings page", () => {
  it("do not display general information and user account list sections", function () {
    visitSettings({
      isHeadAgency: true,
      isRemote: true,
      isOnSite: false,
      isVisibleInCandidateSearchResults: true,
    });
    cy.wait("@getAgencySettingsInfo");
    // Make  sure the page is ready before checking non-existence of the general information section
    cy.get('[data-test="remote-agency"]').should("exist");
    cy.get('[data-test="general-information"]').should("not.exist");
    cy.get('[data-test="user-accounts"]').should("not.exist");
  });

  context("for a remote agency", () => {
    it("display a remote and user accounts section, no on-site section", function () {
      visitSettings({
        isHeadAgency: true,
        isRemote: true,
        isOnSite: false,
        isVisibleInCandidateSearchResults: true,
      });
      cy.wait("@getAgencySettingsInfo");
      cy.get('[data-test="remote-agency"]').should("exist");
      cy.get('[data-test="user-account"]').should("exist");
      cy.get('[data-test="on-site-agency"]').should("not.exist");
      cy.get('[data-test="on-site-agencies"]').should("not.exist");
    });

    it("display a remote section with a 'visible badge' when agency is opened for new candidacies", function () {
      visitSettings({
        isHeadAgency: true,
        isRemote: true,
        isOnSite: false,
        isVisibleInCandidateSearchResults: true,
      });
      cy.wait("@getAgencySettingsInfo");
      cy.get('[data-test="remote-agency"] [data-test="visible-badge"]').should(
        "exist",
      );
    });

    it("display a remote section with a 'invisible badge' when agency is opened for new candidacies", function () {
      visitSettings({
        isHeadAgency: true,
        isRemote: true,
        isOnSite: false,
        isVisibleInCandidateSearchResults: false,
      });
      cy.wait("@getAgencySettingsInfo");
      cy.get(
        '[data-test="remote-agency"] [data-test="invisible-badge"]',
      ).should("exist");
    });
  });

  context("for an on-site agency", () => {
    it("display a on-site and user account sections and no remote section", function () {
      visitSettings({
        isHeadAgency: false,
        isRemote: false,
        isOnSite: true,
        isVisibleInCandidateSearchResults: true,
      });
      cy.wait("@getAgencySettingsInfo");
      cy.get('[data-test="on-site-agency"]').should("exist");
      cy.get('[data-test="user-account"]').should("exist");
      cy.get('[data-test="remote-agency"]').should("not.exist");
      cy.get('[data-test="on-site-agencies"]').should("not.exist");
    });
  });
});
