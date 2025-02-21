import { format } from "date-fns";

import { JuryResult, TypeAccompagnement } from "@/graphql/generated/graphql";
import { stubMutation, stubQuery } from "../utils/graphql";

const typesAccompagnement: TypeAccompagnement[] = ["AUTONOME", "ACCOMPAGNE"];

typesAccompagnement.forEach((typeAccompagnement) => {
  context(`${typeAccompagnement} - Dossier de validation`, () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      });
    });

    context("Inactive dossier de validation", () => {
      it("should show an inactive dossier de validation element in the timeline when the type_accompagnement is autonome and the candidacy status is 'PROJECT'", function () {
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
            });
          },
        );
        cy.intercept("POST", "/api/graphql", (req) => {
          stubMutation(req, "candidate_login", "candidate_login.json");
        });
        cy.login();
        cy.wait("@candidate_login");
        cy.wait("@candidate_getCandidateWithCandidacy");

        cy.get('[data-test="dossier-de-validation-timeline-element"]').should(
          "exist",
        );
        cy.get(
          '[data-test="dossier-de-validation-timeline-element-update-button"]',
        ).should("be.disabled");
        cy.get(
          '[data-test="dossier-de-validation-timeline-element-update-button"]',
        ).should("contain.text", "Compléter");
      });
    });

    context("Update views", () => {
      it("should show an active dossier de validation element in the timeline when the type_accompagnement is autonome and the candidacy status is 'DOSSIER_FAISABILITE_RECEVABLE' and route to the dossier de validation autonome page when clicked on", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_FAISABILITE_RECEVABLE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
              format(new Date(), "yyyy-MM-dd");

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationTimelineElement",
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

        cy.get('[data-test="dossier-de-validation-timeline-element"]').should(
          "exist",
        );
        cy.get(
          '[data-test="dossier-de-validation-timeline-element-update-button"]',
        ).should("be.enabled");
        cy.get(
          '[data-test="dossier-de-validation-timeline-element-update-button"]',
        ).should("contain.text", "Compléter");

        cy.get(
          '[data-test="dossier-de-validation-timeline-element-update-button"]',
        ).click();
        cy.location("pathname").should(
          "equal",
          "/candidat/dossier-de-validation/",
        );
        cy.get("h1").should("contain.text", "Dossier de validation");
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
            });
            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
                candidate,
              );
            });
          },
        );
        cy.intercept("POST", "/api/graphql", (req) => {
          stubMutation(req, "candidate_login", "candidate_login.json");
          stubMutation(
            req,
            "updateReadyForJuryEstimatedAtForDossierDeValidationPage",
            "candidate1-certification-titre-2-selected.json",
          );
        });
        cy.login();
        cy.wait("@candidate_login");
        cy.wait("@candidate_getCandidateWithCandidacy");
        cy.visit("/dossier-de-validation/");
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");

        cy.get(".ready-for-jury-estimated-date-input").type("2035-12-31");
        cy.get(
          '[data-test="submit-ready-for-jury-estimated-date-form-button"]',
        ).click();
        cy.wait("@updateReadyForJuryEstimatedAtForDossierDeValidationPage");
      });

      it("should show the ready for jury estimated date in the timeline when it's set", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_FAISABILITE_RECEVABLE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt = 1727776800000;

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationTimelineElement",
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
        cy.get('[data-test="dossier-de-validation-timeline-element"]').should(
          "contain.text",
          "Vous avez renseigné une date de dépôt prévisionnelle, le 01/10/2024. Assurez-vous de bien transmettre votre dossier de validation à votre certificateur.",
        );
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

        cy.get('button[type="submit"]').click();

        cy.wait("@uploadDossierDeValidation");

        cy.location("pathname").should("equal", "/candidat/");
      });
    });

    context("Read only views", () => {
      it("should let me view a read only version of the ready for jury date tab once the dossier de validation is sent", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_VALIDATION_ENVOYE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt = 1727776800000;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
              { dossierDeValidationOtherFiles: [] };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
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

        cy.visit("/dossier-de-validation/");
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");
        cy.get(".fr-tabs__tab").contains("Date").click();

        cy.get(".ready-for-jury-estimated-date-text").should(
          "contain.text",
          "01/10/2024",
        );
      });

      it("should let me view a read only version of the dossier de validation tab once the dossier de validation is sent", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_VALIDATION_ENVOYE";
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt = 1727776800000;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.activeDossierDeValidation =
              {
                dossierDeValidationOtherFiles: [],
                dossierDeValidationSentAt: 1727776800000,
              };

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationPage",
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

        cy.visit("/dossier-de-validation/");
        cy.wait("@getCandidateWithCandidacyForDossierDeValidationPage");

        cy.get('[data-test="dossier-de-validation-sent-alert"]').should(
          "contain.text",
          "Dossier de validation envoyé le 01/10/2024",
        );
      });
    });

    context("Incomplete dossier de validation", () => {
      it("should show a 'to complete' badge and a warning in the timeline", function () {
        cy.fixture("candidate1-certification-titre-2-selected.json").then(
          (candidate) => {
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
              typeAccompagnement;
            candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
              "DOSSIER_DE_VALIDATION_SIGNALE";

            cy.intercept("POST", "/api/graphql", (req) => {
              stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
              stubQuery(
                req,
                "getCandidateWithCandidacyForDossierDeValidationTimelineElement",
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
          '[data-test="dossier-de-validation-timeline-element"] [data-test="timeline-element-badge"]',
        ).should("contain.text", "À compléter");
        cy.get(
          '[data-test="dossier-de-validation-timeline-element"] [data-test="dossier-de-validation-signale-notice"]',
        ).should("exist");
      });

      it("should show a 'dossier de validation signalé' alert if i open a signaled dossier de validation", function () {
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
                "getCandidateWithCandidacyForDossierDeValidationPage",
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
          '[data-test="dossier-de-validation-timeline-element-update-button"]',
        ).click();
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
              });
            },
          );
          cy.intercept("POST", "/api/graphql", (req) => {
            stubMutation(req, "candidate_login", "candidate_login.json");
          });
          cy.login();
          cy.wait("@candidate_login");
          cy.wait("@candidate_getCandidateWithCandidacy");

          cy.get('[data-test="dossier-de-validation-timeline-element"]').should(
            "exist",
          );
          cy.get(
            '[data-test="dossier-de-validation-timeline-element-update-button"]',
          ).should("be.enabled");
          cy.get(
            '[data-test="dossier-de-validation-to-complete-badge"]',
          ).should("exist");
        });
      });
    });
  });
});
