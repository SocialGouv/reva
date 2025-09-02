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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
                candidate,
              );
            });
          },
        );
        cy.login();

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);
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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
                candidate,
              );
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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
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

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
                candidate,
              );
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
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

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

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

      it("should let me add and remove additional attachments", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
                candidate,
              );
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
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

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

        cy.visit("/dossier-de-validation/");
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");

        cy.get(".fr-tabs__tab").contains("du dossier").click();

        cy.get('input[name^="dossierDeValidationOtherFiles"]').should(
          "not.exist",
        );

        cy.get("button")
          .contains("Ajouter une pièce jointe supplémentaire")
          .click();

        cy.get('input[name="dossierDeValidationOtherFiles.0"]').should("exist");

        cy.get('input[name="dossierDeValidationOtherFiles.0"]').selectFile({
          contents: Cypress.Buffer.from("additional file 1"),
          fileName: "additional1.pdf",
        });

        cy.get("button")
          .contains("Ajouter une pièce jointe supplémentaire")
          .click();

        cy.get('input[name="dossierDeValidationOtherFiles.1"]').should("exist");

        cy.get('input[name="dossierDeValidationOtherFiles.1"]').selectFile({
          contents: Cypress.Buffer.from("additional file 2"),
          fileName: "additional2.jpg",
        });

        cy.get('input[name="dossierDeValidationOtherFiles.0"]').should("exist");
        cy.get('input[name="dossierDeValidationOtherFiles.1"]').should("exist");

        cy.get('input[name="dossierDeValidationOtherFiles.0"]')
          .closest(".fr-upload-group")
          .contains("button", "Supprimer")
          .click();

        cy.get('input[name="dossierDeValidationOtherFiles.0"]').should("exist");
        cy.get('input[name="dossierDeValidationOtherFiles.1"]').should(
          "not.exist",
        );

        cy.get('input[name="dossierDeValidationOtherFiles.0"]')
          .closest(".fr-upload-group")
          .contains("button", "Supprimer")
          .click();

        cy.get('input[name^="dossierDeValidationOtherFiles"]').should(
          "not.exist",
        );
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
              ESTIMATED_DATE;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
              { dossierDeValidationOtherFiles: [] };
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.jury =
              {
                result: "SUCCESS",
              };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

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
              ESTIMATED_DATE;
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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

        cy.get('[data-test="dossier-validation-tile"] button').should("exist");
        cy.get('[data-test="incomplete-dv-banner"]').should("exist");
      });

      it("should show a 'dossier de validation signalé' alert with date and reason if i open a signaled dossier de validation", function () {
        const signalDate = new Date("2025-09-01");
        const signalReason = "Le dossier de validation est illisible.";

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
                decisionSentAt: signalDate.getTime(),
                decisionComment: signalReason,
              };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
                candidate,
              );
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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

        cy.get('[data-test="dossier-validation-tile"] button').click();
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");
        cy.get(".fr-tabs__tab").contains("du dossier").click();

        cy.get('[data-test="dossier-de-validation-signale-alert"]').should(
          "exist",
        );

        cy.get(
          '[data-test="dossier-de-validation-signale-alert"] .fr-alert__title',
        ).should(
          "contain",
          "Dossier de validation signalé par le certificateur le 01/09/2025",
        );

        cy.get('[data-test="dossier-de-validation-signale-alert"]')
          .should("contain", "Motif du signalement :")
          .should("contain", signalReason);
      });

      it("should show accordion with previous dossiers when there are multiple signalements", function () {
        const currentSignalDate = new Date("2024-03-20");
        const currentSignalReason = "Dernier commentaire";

        const previousSignalDate1 = new Date("2024-02-10");
        const previousSignalReason1 = "Premier commentaire";

        const previousSignalDate2 = new Date("2024-01-05");
        const previousSignalReason2 = "Deuxième commentaire";

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
                decisionSentAt: currentSignalDate.getTime(),
                decisionComment: currentSignalReason,
                history: [
                  {
                    id: "history-1",
                    decisionSentAt: previousSignalDate1.getTime(),
                    decisionComment: previousSignalReason1,
                  },
                  {
                    id: "history-2",
                    decisionSentAt: previousSignalDate2.getTime(),
                    decisionComment: previousSignalReason2,
                  },
                ],
              };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
                candidate,
              );
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
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
                candidate,
              );
            });
          },
        );

        cy.login();

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

        cy.get('[data-test="dossier-validation-tile"] button').click();
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");
        cy.get(".fr-tabs__tab").contains("du dossier").click();

        cy.get('[data-test="dossier-de-validation-signale-alert"]').should(
          "exist",
        );

        cy.get(".fr-accordion").should(
          "contain",
          "Voir les anciens dossiers de validation",
        );

        cy.get(".fr-accordion__btn").click();

        cy.get(".fr-accordion .fr-collapse")
          .should("contain", "Dossier signalé le 10/02/2024")
          .should("contain", previousSignalReason1)
          .should("contain", "Dossier signalé le 05/01/2024")
          .should("contain", previousSignalReason2);
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
                  "candidate_getCandidateWithCandidacyForLayout",
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
                stubQuery(
                  req,
                  "candidate_getCandidateWithCandidacyForHome",
                  candidate,
                );
              });
            },
          );

          cy.login();

          cy.wait([
            "@candidate_getCandidateWithCandidacyForLayout",
            "@candidate_getCandidateWithCandidacyForHome",
            "@candidate_getCandidateWithCandidacyForDashboard",
          ]);

          cy.get('[data-test="dossier-validation-tile"] button').should(
            "not.be.disabled",
          );
          cy.get('[data-test="dossier-validation-badge-to-send"]').should(
            "exist",
          );
        });
      });
    });

    context("Resources Section", () => {
      it("should display resources section with PDF template download", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_FAISABILITE_RECEVABLE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
              format(ESTIMATED_DATE, "yyyy-MM-dd");

            // Add additionalInfo with PDF template
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.certification.additionalInfo =
              {
                dossierDeValidationTemplate: {
                  name: "Trame_Dossier_Validation.pdf",
                  previewUrl: "https://example.com/template.pdf",
                },
                dossierDeValidationLink: null,
              };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
                candidate,
              );
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
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

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

        cy.visit("/dossier-de-validation/");
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");

        cy.get(".fr-tabs__tab").contains("du dossier").click();

        cy.get("aside").should("contain", "Trame du dossier de validation");

        cy.get("aside")
          .find("a[href='https://example.com/template.pdf'][target='_blank']")
          .should("exist");
      });

      it("should display resources section with URL template link", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_FAISABILITE_RECEVABLE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
              format(ESTIMATED_DATE, "yyyy-MM-dd");

            // Add additionalInfo with URL link only
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.certification.additionalInfo =
              {
                dossierDeValidationTemplate: null,
                dossierDeValidationLink: "https://example.com/template-link",
              };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
                candidate,
              );
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
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

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

        cy.visit("/dossier-de-validation/");
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");

        cy.get(".fr-tabs__tab").contains("du dossier").click();

        cy.get("aside").should("contain", "Ressources :");

        cy.get("aside")
          .find("a[href='https://example.com/template-link'][target='_blank']")
          .should("exist");
        cy.get("aside").should("contain", "Trame du dossier de validation");
      });

      it("should display resources section without template when no template is provided", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_FAISABILITE_RECEVABLE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
              format(ESTIMATED_DATE, "yyyy-MM-dd");

            // Add additionalInfo with no template
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.certification.additionalInfo =
              {
                dossierDeValidationTemplate: null,
                dossierDeValidationLink: null,
              };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForLayout",
                candidate,
              );
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
                candidate,
              );
              stubQuery(
                req,
                "candidate_getCandidateWithCandidacyForHome",
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

        cy.wait([
          "@candidate_getCandidateWithCandidacyForLayout",
          "@candidate_getCandidateWithCandidacyForHome",
          "@candidate_getCandidateWithCandidacyForDashboard",
        ]);

        cy.visit("/dossier-de-validation/");
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");

        cy.get(".fr-tabs__tab").contains("du dossier").click();

        cy.get("aside").should("not.contain", "Trame du dossier de validation");

        cy.get("aside").should(
          "contain",
          "Comment rédiger son dossier de validation ?",
        );
        cy.get("aside").should(
          "contain",
          "Consultez la fiche de la certification",
        );
      });
    });
  });
});
