import { stubMutation, stubQuery } from "../../utils/graphql";

context("Accompagnement autonome - Dossier de validation", () => {
  it("should show an inactive dossier de validation element in the timeline when the type_accompagnement is autonome and the candidacy status is 'PROJECT'", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForDossierDeValidationAutonomeTimelineElement",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element"]',
    ).should("exist");
    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element-update-button"]',
    ).should("be.disabled");
    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element-update-button"]',
    ).should("contain.text", "Compléter");
  });

  it("should show an active dossier de validation element in the timeline when the type_accompagnement is autonome and the candidacy status is 'DOSSIER_FAISABILITE_RECEVABLE' and route to the dossier de validation autonome page when clicked on", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "DOSSIER_FAISABILITE_RECEVABLE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForDossierDeValidationAutonomeTimelineElement",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");

    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element"]',
    ).should("exist");
    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element-update-button"]',
    ).should("be.enabled");
    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element-update-button"]',
    ).should("contain.text", "Compléter");

    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element-update-button"]',
    ).click();
    cy.location("pathname").should(
      "equal",
      "/candidat/dossier-de-validation-autonome/",
    );
    cy.get("h1").should("contain.text", "Dossier de validation");
  });

  it("should let me change the readyForJuryEstimatedAt date", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "DOSSIER_FAISABILITE_RECEVABLE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        });
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "getCandidateWithCandidacyForDossierDeValidationAutonomePage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
      stubMutation(
        req,
        "updateReadyForJuryEstimatedAtForDossierDeValidationAutonomePage",
        "candidate1-certification-titre-2-selected.json",
      );
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.visit("/dossier-de-validation-autonome/");
    cy.wait("@getCandidateWithCandidacyForDossierDeValidationAutonomePage");

    cy.get(".ready-for-jury-estimated-date-input").type("2035-12-31");
    cy.get(
      '[data-test="submit-ready-for-jury-estimated-date-form-button"]',
    ).click();
    cy.wait("@updateReadyForJuryEstimatedAtForDossierDeValidationAutonomePage");
  });

  it("should show the ready for jury estimated date in the timeline when it's set", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "DOSSIER_FAISABILITE_RECEVABLE";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt = 1727776800000;

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
          stubQuery(
            req,
            "getCandidateWithCandidacyForDossierDeValidationAutonomeTimelineElement",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });
    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.get(
      '[data-test="dossier-de-validation-autonome-timeline-element"]',
    ).should(
      "contain.text",
      "Vous avez renseigné une date de dépôt prévisionnelle, le 01/10/2024.Assurez-vous de bien transmettre votre dossier de validation à votre certificateur.",
    );
  });

  it("should let me send a dossier de validation", function () {
    cy.fixture("candidate1-certification-titre-2-selected.json").then(
      (candidate) => {
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
          "AUTONOME";
        candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
          "DOSSIER_FAISABILITE_RECEVABLE";

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
        });
        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(
            req,
            "getCandidateWithCandidacyForDossierDeValidationAutonomePage",
            candidate,
          );
        });
      },
    );
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });

    cy.intercept(
      "POST",
      "/api/dossier-de-validation/upload-dossier-de-validation",
      { fixture: "candidate1-certification-titre-2-selected.json" },
    ).as("uploadDossierDeValidation");

    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.visit("/dossier-de-validation-autonome/");
    cy.wait("@getCandidateWithCandidacyForDossierDeValidationAutonomePage");

    cy.get(".fr-tabs__tab").contains("du dossier").click();

    cy.get(
      ".dossier-de-validation-file-upload > .fr-upload-group > input",
    ).selectFile({
      contents: Cypress.Buffer.from("file contents"),
      fileName: "file.pdf",
    });

    cy.get('[data-test="dossier-de-validation-checkbox-group"]')
      .find("label")
      .click({ multiple: true });

    cy.get('button[type="submit"]').click();

    cy.wait("@uploadDossierDeValidation");

    cy.location("pathname").should("equal", "/candidat/");
  });
});
