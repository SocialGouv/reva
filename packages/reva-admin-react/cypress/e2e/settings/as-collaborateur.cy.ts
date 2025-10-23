import { stubQuery } from "../../utils/graphql";

function visitSettings({
  modaliteAccompagnement,
  modaliteAccompagnementRenseigneeEtValide,
  isVisibleInCandidateSearchResults,
}: {
  modaliteAccompagnement: "A_DISTANCE" | "LIEU_ACCUEIL";
  modaliteAccompagnementRenseigneeEtValide: boolean;
  isVisibleInCandidateSearchResults: boolean;
}) {
  cy.fixture("account/collaborateur-settings.json").then((settings) => {
    settings.data.account_getAccountForConnectedUser.organisms[0].modaliteAccompagnement =
      modaliteAccompagnement;
    settings.data.account_getAccountForConnectedUser.organisms[0].modaliteAccompagnementRenseigneeEtValide =
      modaliteAccompagnementRenseigneeEtValide;
    settings.data.account_getAccountForConnectedUser.organisms[0].isVisibleInCandidateSearchResults =
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
      stubQuery(req, "getCollaborateurSettingsInfo", settings);
      stubQuery(req, "getAccountInfo", "account/collaborateur-info.json");
      stubQuery(
        req,
        "getMaisonMereCGUQuery",
        "account/gestionnaire-cgu-new.json",
      );
    });
  });

  cy.collaborateur("/agencies-settings-v3/");
}

context("Collaborateur AAP settings page", () => {
  it("do not display general information and user account list sections", function () {
    visitSettings({
      modaliteAccompagnement: "A_DISTANCE",
      modaliteAccompagnementRenseigneeEtValide: true,
      isVisibleInCandidateSearchResults: true,
    });
    cy.wait("@getCollaborateurSettingsInfo");
    // Make  sure the page is ready before checking non-existence of the general information section
    cy.get('[data-test="remote-organism"]').should("exist");
    cy.get('[data-test="general-information"]').should("not.exist");
    cy.get('[data-test="user-accounts"]').should("not.exist");
  });

  context("for a remote organism", () => {
    it("display a remote and user accounts section, no on-site section", function () {
      visitSettings({
        modaliteAccompagnement: "A_DISTANCE",
        modaliteAccompagnementRenseigneeEtValide: true,
        isVisibleInCandidateSearchResults: true,
      });
      cy.wait("@getCollaborateurSettingsInfo");
      cy.get('[data-test="remote-organism"]').should("exist");
      cy.get('[data-test="user-account"]').should("exist");
      cy.get('[data-test="on-site-organism"]').should("not.exist");
      cy.get('[data-test="on-site-organisms"]').should("not.exist");
    });

    it("display a remote section with a 'visible badge' when organism is opened for new candidacies", function () {
      visitSettings({
        modaliteAccompagnement: "A_DISTANCE",
        modaliteAccompagnementRenseigneeEtValide: true,
        isVisibleInCandidateSearchResults: true,
      });
      cy.wait("@getCollaborateurSettingsInfo");
      cy.get(
        '[data-test="remote-organism"] [data-test="visible-badge"]',
      ).should("exist");
    });

    it("display a remote section with a 'invisible badge' when organism is opened for new candidacies", function () {
      visitSettings({
        modaliteAccompagnement: "A_DISTANCE",
        modaliteAccompagnementRenseigneeEtValide: true,
        isVisibleInCandidateSearchResults: false,
      });
      cy.wait("@getCollaborateurSettingsInfo");
      cy.get(
        '[data-test="remote-organism"] [data-test="invisible-badge"]',
      ).should("exist");
    });
  });

  context("for an on-site organism", () => {
    it("display a on-site and user account sections and no remote section", function () {
      visitSettings({
        modaliteAccompagnement: "LIEU_ACCUEIL",
        modaliteAccompagnementRenseigneeEtValide: true,
        isVisibleInCandidateSearchResults: true,
      });
      cy.wait("@getCollaborateurSettingsInfo");
      cy.get('[data-test="on-site-organism"]').should("exist");
      cy.get('[data-test="user-account"]').should("exist");
      cy.get('[data-test="remote-organism"]').should("not.exist");
      cy.get('[data-test="on-site-organisms"]').should("not.exist");
    });
  });
});
