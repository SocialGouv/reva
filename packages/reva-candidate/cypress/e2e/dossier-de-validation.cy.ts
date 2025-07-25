import { addDays, addMonths, format } from "date-fns";

import { JuryResult, TypeAccompagnement } from "@/graphql/generated/graphql";

import { stubMutation, stubQuery } from "../utils/graphql";

const DATE_NOW = new Date();
const ESTIMATED_DATE = addMonths(DATE_NOW, 10);
const SENT_DATE = addDays(DATE_NOW, 15);

const typesAccompagnement: TypeAccompagnement[] = ["AUTONOME", "ACCOMPAGNE"];

typesAccompagnement.forEach((typeAccompagnement) => {
  context(`${typeAccompagnement} - Dossier de validation`, () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
        stubQuery(
          req,
          "candidate_getCandidateWithCandidacyForDashboard",
          "candidate1.json",
        );
      });
    });

    context("Inactive dossier de validation", () => {
      it("should show an inactive dossier de validation element in the dashboard when the type_accompagnement is autonome and the candidacy status is 'PROJECT'", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationTimelineElement",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForDashboard",
                candidate,
              );
            });
          },
        );
        cy.login();

        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@candidate_getCandidateWithCandidacyForDashboard");
        cy.get('[data-test="dossier-validation-tile"] button')
          .should("exist")
          .should("be.disabled");
      });
    });

    context("Update views", () => {
      it("should show an active dossier de validation element in the dashboard when the type_accompagnement is autonome and the candidacy status is 'DOSSIER_FAISABILITE_RECEVABLE' and route to the dossier de validation autonome page when clicked on", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_FAISABILITE_RECEVABLE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
              format(ESTIMATED_DATE, "yyyy-MM-dd");
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility.decision =
              "ADMISSIBLE";

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationTimelineElement",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForDashboard",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

        cy.get('[data-test="dossier-validation-tile"] button').should(
          "not.be.disabled",
        );

        cy.get('[data-test="dossier-validation-tile"] button').click();
        cy.location("pathname").should(
          "equal",
          "/candidat/dossier-de-validation/",
        );
      });

      it("should let me change the readyForJuryEstimatedAt date", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_FAISABILITE_RECEVABLE";

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForDashboard",
                candidate,
              );
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
                candidate,
              );
            });
          },
        );
        cy.intercept("POST", "/api/graphql", (req) => {
          stubMutation(
            req,
            "updateReadyForJuryEstimatedAtForDossierDeValidationPage",
            "candidate1-certification-titre-2-selected.json",
          );
        });
        cy.login();

        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

        cy.visit("/dossier-de-validation/");
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");

        cy.get('[data-test="ready-for-jury-estimated-date-input"]').type(
          format(ESTIMATED_DATE, "yyyy-MM-dd"),
        );
        cy.get(
          '[data-test="submit-ready-for-jury-estimated-date-form-button"]',
        ).click();
        cy.wait("@updateReadyForJuryEstimatedAtForDossierDeValidationPage");
      });

      it("should let me send a dossier de validation", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_FAISABILITE_RECEVABLE";

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForDashboard",
                candidate,
              );
            });
          },
        );

        cy.intercept(
          "POST",
          "/api/dossier-de-validation/upload-dossier-de-validation",
          { fixture: "candidate1-certification-titre-2-selected.json" },
        ).as("uploadDossierDeValidation");

        cy.login();

        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

        cy.visit("/dossier-de-validation/");
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");

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

        cy.get(
          '[data-test="submit-dossier-de-validation-form-button"]',
        ).click();

        cy.wait("@uploadDossierDeValidation");

        cy.location("pathname").should("equal", "/candidat/");
      });
    });

    context("Read only views", () => {
      it("should let me view a read only version of the ready for jury date tab when dossier de validation is sent and no failed jury result", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_VALIDATION_ENVOYE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
              ESTIMATED_DATE.getTime();
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
              { dossierDeValidationOtherFiles: [] };
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.jury =
              {
                result: "SUCCESS",
              };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForDashboard",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

        cy.visit("/dossier-de-validation/");
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");
        cy.get(".fr-tabs__tab").contains("Date").click();

        cy.get(".ready-for-jury-estimated-date-text").should(
          "contain.text",
          format(ESTIMATED_DATE, "dd/MM/yyyy"),
        );
      });

      it("should let me view a read only version of the dossier de validation tab when dossier is sent and no failed jury result", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_VALIDATION_ENVOYE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
              ESTIMATED_DATE.getTime();
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
              {
                dossierDeValidationOtherFiles: [],
                dossierDeValidationSentAt: SENT_DATE.getTime(),
              };
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.jury =
              {
                result: "SUCCESS",
              };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForDashboard",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

        cy.visit("/dossier-de-validation/");
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");

        cy.get('[data-test="dossier-de-validation-sent-alert"]').should(
          "exist",
        );
      });

      it("should not be read only when dossier is sent but has failed jury result", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_VALIDATION_ENVOYE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
              {
                dossierDeValidationOtherFiles: [],
                dossierDeValidationSentAt: SENT_DATE.getTime(),
              };
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.jury =
              {
                result: "FAILURE",
              };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationTimelineElement",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForDashboard",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

        cy.get('[data-test="dossier-validation-tile"] button').should(
          "not.be.disabled",
        );
      });
    });

    context("Incomplete dossier de validation", () => {
      it("should show a 'to complete' badge and a warning in the dashboard", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_DE_VALIDATION_SIGNALE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
              {
                dossierDeValidationOtherFiles: [],
                decision: "INCOMPLETE",
              };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationTimelineElement",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForDashboard",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

        cy.get('[data-test="dossier-validation-tile"] button').should("exist");
        cy.get('[data-test="incomplete-dv-banner"]').should("exist");
      });

      it("should show a 'dossier de validation signalé' alert if i open a signaled dossier de validation", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_DE_VALIDATION_SIGNALE";

            candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility.decision =
              "ADMISSIBLE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
              {
                dossierDeValidationOtherFiles: [],
                decision: "INCOMPLETE",
              };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationTimelineElement",
                candidate,
              );
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForDashboard",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

        cy.get('[data-test="dossier-validation-tile"] button').click();
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");
        cy.get(".fr-tabs__tab").contains("du dossier").click();
        cy.get('[data-test="dossier-de-validation-signale-alert"]').should(
          "exist",
        );
      });
    });

    context("Failed jury result", () => {
      const failedJuryResults: JuryResult[] = [
        "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
        "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
        "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
        "FAILURE",
        "CANDIDATE_EXCUSED",
        "CANDIDATE_ABSENT",
      ];

      failedJuryResults.forEach((juryResult) => {
        it(`should show active dossier de validation when jury result is ${juryResult}`, function () {
          cy.fixture("candidate1-certification-titre-2-selected.json").then(
            (candidate) => {
              candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
                typeAccompagnement;
              candidate.data.candidate_getCandidateWithCandidacy.candidacy.jury =
                {
                  result: juryResult,
                };

              cy.intercept("POST", "/api/graphql", (req) => {
                stubQuery(
                  req,
                  "candidate_getCandidateWithCandidacy",
                  candidate,
                );
                stubQuery(
                  req,
                  "getCandidateWithCandidacyForDossierDeValidationTimelineElement",
                  candidate,
                );
                stubQuery(
                  req,
                  "candidate_getCandidateWithCandidacyForDashboard",
                  candidate,
                );
              });
            },
          );

          cy.login();

          cy.wait("@candidate_getCandidateWithCandidacy");
          cy.wait("@candidate_getCandidateWithCandidacyForDashboard");

          cy.get('[data-test="dossier-validation-tile"] button').should(
            "not.be.disabled",
          );
          cy.get('[data-test="dossier-validation-badge-to-send"]').should(
            "exist",
          );
        });
      });
    });
  });
});
