import { stubMutation, stubQuery } from "../utils/graphql";

context("Empty candidacy", () => {
  it("prevent organism selection", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-1.json",
      );
      stubQuery(req, "getCandidacyByIdForCandidacyGuard", "candidacy1.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(req, "getCandidacyByIdWithCandidate", "candidacy1.json");
      stubQuery(req, "getCandidacyByIdForDashboard", "candidacy1.json");
    });
    cy.login();

    cy.wait([
      "@candidate_getCandidateWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);

    cy.get('[data-test="organism-tile"] button').should("be.disabled");
  });
});

context("Candidacy with certification selected", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(
        req,
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-3.json",
      );
      stubQuery(req, "getCandidacyByIdForCandidacyGuard", "candidacy3.json");
      stubQuery(req, "getCandidacyByIdWithCandidate", "candidacy3.json");
      stubQuery(req, "getCandidacyByIdForDashboard", "candidacy3.json");

      stubQuery(req, "getRandomOrganismsForCandidacy", "organism.json");

      stubQuery(req, "getCandidacyByIdForSetOrganism", "candidacy3.json");
    });

    cy.login();

    cy.wait([
      "@candidate_getCandidateWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);

    cy.get('[data-test="organism-tile"] button').click();
    cy.wait("@getRandomOrganismsForCandidacy");
    cy.wait("@getCandidacyByIdForSetOrganism");
  });

  it("list all available organisms", function () {
    cy.get('[data-test="project-organisms-organism-o1"]').within(() => {
      cy.get(".fr-card__title").should("have.text", "Architecte 1");
      cy.get('[data-test="project-organisms-organism-email"]').should(
        "have.text",
        "email@exemple.com",
      );
      cy.get('[data-test="project-organisms-organism-phone"]').should(
        "have.text",
        "0111111111",
      );
      cy.get('[data-test="project-organisms-onsite-tag"]').should("exist");
      cy.get('[data-test="project-organisms-remote-tag"]').should("not.exist");
    });

    cy.get('[data-test="project-organisms-organism-o2"]').within(() => {
      cy.get(".fr-card__title").should("have.text", "Architecte 2");
      cy.get('[data-test="project-organisms-organism-email"]').should(
        "have.text",
        "email2@exemple.com",
      );
      cy.get('[data-test="project-organisms-organism-phone"]').should(
        "have.text",
        "0222222222",
      );
      cy.get('[data-test="project-organisms-onsite-tag"]').should("not.exist");
      cy.get('[data-test="project-organisms-remote-tag"]').should("exist");
    });
  });

  it("on site filters should be enabled only when on site is selected", function () {
    cy.get('[data-test="input-wrapper-zip"] input').should("be.disabled");
    cy.get('[data-test="checkbox-wrapper-pmr-input"]').should("be.disabled");

    cy.get('[data-test="button-select-onsite"]').click();

    cy.get('[data-test="button-select-onsite"]').should(
      "have.attr",
      "aria-pressed",
      "true",
    );
    cy.get('[data-test="input-wrapper-zip"] input').should("not.be.disabled");
    cy.get('[data-test="checkbox-wrapper-pmr-input"]').should(
      "not.be.disabled",
    );

    cy.get('[data-test="input-wrapper-zip"] input').type("44000");
    cy.get('[data-test="button-select-remote"]').click();

    cy.get('[data-test="input-wrapper-zip"] input').should("be.disabled");
    cy.get('[data-test="checkbox-wrapper-pmr-input"]').should("be.disabled");
  });

  it("zip value is reset when on site is deselected", function () {
    cy.get('[data-test="button-select-onsite"]').click();
    cy.get('[data-test="input-wrapper-zip"] input').type("44000");

    cy.get('[data-test="button-select-remote"]').click();
    cy.get('[data-test="input-wrapper-zip"] input').should("have.value", "");

    cy.get('[data-test="button-select-onsite"]').click();
    cy.get('[data-test="input-wrapper-zip"] input').should("have.value", "");
  });

  it("submit first organism", function () {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidacy_selectOrganism", "selected-organism.json");
    });

    cy.get('[data-test="project-organisms-submit-organism-o1').click();

    cy.wait(["@candidacy_selectOrganism"]);

    //TODO ajouter un check sur les AapContactTile
  });
});

context("Candidacy with no organism results", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(
        req,
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-3.json",
      );
      stubQuery(req, "getCandidacyByIdForCandidacyGuard", "candidacy3.json");
      stubQuery(req, "getCandidacyByIdWithCandidate", "candidacy3.json");
      stubQuery(req, "getCandidacyByIdForDashboard", "candidacy3.json");

      stubQuery(req, "getRandomOrganismsForCandidacy", {
        data: {
          getRandomOrganismsForCandidacy: {
            rows: [],
            totalRows: 0,
          },
        },
      });

      stubQuery(req, "getCandidacyByIdForSetOrganism", "candidacy3.json");
    });

    cy.login();

    cy.wait([
      "@candidate_getCandidateWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);

    cy.get('[data-test="organism-tile"] button').click();
    cy.wait("@getRandomOrganismsForCandidacy");
    cy.wait("@getCandidacyByIdForSetOrganism");
  });

  it(`search by name with no result should return a empty state but with no filter reset button`, function () {
    cy.get('[data-test="search-bar-input"]').type("abcd {enter}");
    cy.wait("@getRandomOrganismsForCandidacy");

    cy.get('[data-test="no-results-for-search-by-name"]').should("exist");
    cy.get(`[data-test="no-results-button-reset-filters"]`).should("not.exist");
  });

  it(`filters with no result should return a empty state with a filter reset button`, function () {
    cy.get('[data-test="button-select-onsite"]').click();
    cy.wait("@getRandomOrganismsForCandidacy");

    cy.get('[data-test="no-results-for-filters"]').should("exist");
    cy.get(`[data-test="no-results-button-reset-filters"]`).should("exist");
  });

  ["no-results-button-reset-filters", "sidebar-button-reset-filters"].forEach(
    (filterButton) => {
      it(`on site filters can be reset with ${filterButton}`, function () {
        cy.get('[data-test="button-select-onsite"]').click();
        cy.get('[data-test="button-select-onsite"]').should(
          "have.attr",
          "aria-pressed",
          "true",
        );
        cy.get('[data-test="input-wrapper-zip"] input').type("44000");
        cy.get('[data-test="checkbox-wrapper-pmr-input"]').check({
          force: true,
        });

        cy.wait("@getRandomOrganismsForCandidacy");

        cy.get(`[data-test="${filterButton}"]`).click();
        cy.get('[data-test="button-select-onsite"]').should(
          "have.attr",
          "aria-pressed",
          "false",
        );
        cy.get('[data-test="input-wrapper-zip"] input').should(
          "have.value",
          "",
        );
        cy.get('[data-test="checkbox-wrapper-pmr-input"]').should(
          "not.be.checked",
        );
      });

      it(`remote filters can be reset with ${filterButton}`, function () {
        cy.get('[data-test="button-select-remote"]').click();
        cy.get('[data-test="button-select-remote"]').should(
          "have.attr",
          "aria-pressed",
          "true",
        );

        cy.get(`[data-test="${filterButton}"]`).click();
        cy.get('[data-test="button-select-remote"]').should(
          "have.attr",
          "aria-pressed",
          "false",
        );
      });

      it(`mcf filter can be reset with ${filterButton}`, function () {
        cy.get('[data-test="checkbox-wrapper-mcf-input"]').check({
          force: true,
        });

        cy.get(`[data-test="${filterButton}"]`).click();
        cy.get('[data-test="checkbox-wrapper-mcf-input"]').should(
          "not.be.checked",
        );
      });
    },
  );
});
