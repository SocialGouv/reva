import { addDays, addMonths, format } from "date-fns";

import {
  JuryResult,
  TypeAccompagnement,
  CandidacyStatusStep,
  FeasibilityDecision,
  DossierDeValidationDecision,
} from "@/graphql/generated/graphql";

import { stubQuery } from "../utils/graphql";

const DATE_NOW = new Date();
const ESTIMATED_DATE = addMonths(DATE_NOW, 10);
const SENT_DATE = addDays(DATE_NOW, 15);

interface DossierDeValidationFixture {
  decision?: DossierDeValidationDecision;
  decisionSentAt?: number;
  decisionComment?: string;
  dossierDeValidationSentAt?: number;
  dossierDeValidationFile?: {
    name: string;
    previewUrl?: string | null;
  };
  dossierDeValidationOtherFiles?: Array<{
    name: string;
    previewUrl?: string | null;
  }>;
  history?: Array<{
    id: string;
    decisionSentAt?: number;
    decisionComment?: string;
  }>;
}

interface CandidateFixtureOptions {
  typeAccompagnement?: TypeAccompagnement;
  status?: CandidacyStatusStep;
  readyForJuryEstimatedAt?: Date;
  feasibilityDecision?: FeasibilityDecision;
  juryResult?: JuryResult;
  juryInfo?: {
    informationOfResult?: string;
    dateOfResult?: number;
    dateOfSession?: number;
  };
  activeDossierDeValidation?: DossierDeValidationFixture;
  additionalInfo?: {
    dossierDeValidationTemplate?: {
      name?: string;
      previewUrl?: string | null;
      mimeType?: string;
      url?: string;
    } | null;
    dossierDeValidationLink?: string | null;
  };
}

function setupCandidateFixture(options: CandidateFixtureOptions = {}) {
  return cy
    .fixture("candidacy1-certification-titre-2-selected.json")
    .then((json) => {
      const clonedJson = structuredClone(json);
      const candidacy = clonedJson.data.getCandidacyById;

      if (options.typeAccompagnement) {
        candidacy.typeAccompagnement = options.typeAccompagnement;
      }

      if (options.status) {
        candidacy.status = options.status;
      }

      if (options.readyForJuryEstimatedAt) {
        candidacy.readyForJuryEstimatedAt = format(
          options.readyForJuryEstimatedAt,
          "yyyy-MM-dd",
        );
      }

      if (options.feasibilityDecision) {
        candidacy.feasibility.decision = options.feasibilityDecision;
      }

      if (options.juryResult) {
        candidacy.jury = {
          result: options.juryResult,
          ...options.juryInfo,
        };
      }

      if (options.activeDossierDeValidation) {
        candidacy.activeDossierDeValidation = options.activeDossierDeValidation;
      }

      if (options.additionalInfo) {
        candidacy.certification.additionalInfo = options.additionalInfo;
      }

      return clonedJson;
    });
}

function setupGraphQLStubs(
  candidate: { data: { candidate_getCandidateWithCandidacy: object } },
  additionalQueries: string[] = [],
) {
  const defaultQueries = [
    "getCandidacyByIdForCandidacyGuard",
    "getCandidacyByIdWithCandidate",
    "getCandidacyByIdForDashboard",
  ];

  const allQueries = [...defaultQueries, ...additionalQueries];

  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    stubQuery(
      req,
      "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
      "candidacies-with-candidacy-1.json",
    );
    allQueries.forEach((query) => {
      stubQuery(req, query, candidate);
    });
  });
}

function loginAndWaitForQueries(queryAliases: string[] = []) {
  const defaultAliases = [
    "@candidate_getCandidateWithCandidaciesForCandidaciesGuard",
    "@getCandidacyByIdForCandidacyGuard",
    "@getCandidacyByIdWithCandidate",
    "@getCandidacyByIdForDashboard",
  ];

  cy.login();
  cy.wait([...defaultAliases, ...queryAliases]);
}

function navigateToDossierValidation(candidacyId: string) {
  cy.visit(`/${candidacyId}/dossier-de-validation/`);
  cy.wait("@getCandidacyByIdForDossierDeValidationPage");
}

function clickDossierTab() {
  cy.get(".fr-tabs__tab").contains("du dossier").click();
}

function uploadFile(
  selector: string,
  fileName: string,
  content: string,
  mimeType: string = "application/pdf",
) {
  cy.get(selector).selectFile({
    contents: Cypress.Buffer.from(content),
    fileName,
    mimeType,
  });
}

const typesAccompagnement: TypeAccompagnement[] = ["AUTONOME", "ACCOMPAGNE"];

typesAccompagnement.forEach((typeAccompagnement) => {
  context(`${typeAccompagnement} - Dossier de validation`, () => {
    context("Read only views", () => {
      it("should let me view a read only version of the ready for jury date tab when dossier de validation is sent and no failed jury result", function () {
        setupCandidateFixture({
          typeAccompagnement,
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          readyForJuryEstimatedAt: ESTIMATED_DATE,
          activeDossierDeValidation: { dossierDeValidationOtherFiles: [] },
          juryResult: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
        }).then((candidacy) => {
          setupGraphQLStubs(candidacy, [
            "getCandidacyByIdForDossierDeValidationPage",
          ]);
          loginAndWaitForQueries();
          navigateToDossierValidation(candidacy.data.getCandidacyById.id);

          cy.get(".fr-tabs__tab").contains("Date").click();
          cy.get(".ready-for-jury-estimated-date-text").should(
            "contain.text",
            format(ESTIMATED_DATE, "dd/MM/yyyy"),
          );
        });
      });

      it("should let me view a read only version of the dossier de validation tab when dossier is sent and no failed jury result", function () {
        setupCandidateFixture({
          typeAccompagnement,
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          readyForJuryEstimatedAt: ESTIMATED_DATE,
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
            dossierDeValidationSentAt: SENT_DATE.getTime(),
          },
          juryResult: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
        }).then((candidacy) => {
          setupGraphQLStubs(candidacy, [
            "getCandidacyByIdForDossierDeValidationPage",
          ]);
          loginAndWaitForQueries();
          navigateToDossierValidation(candidacy.data.getCandidacyById.id);

          cy.get('[data-testid="dossier-de-validation-sent-alert"]').should(
            "exist",
          );
        });
      });

      it("should not be read only when dossier is sent but has failed jury result", function () {
        setupCandidateFixture({
          typeAccompagnement,
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
            dossierDeValidationSentAt: SENT_DATE.getTime(),
          },
          juryResult: "FAILURE",
        }).then((candidacy) => {
          setupGraphQLStubs(candidacy);
          loginAndWaitForQueries();

          cy.get('[data-testid="dossier-validation-tile"] button').should(
            "not.be.disabled",
          );
        });
      });
    });

    context("Incomplete dossier de validation", () => {
      it("should show a 'to complete' badge and a warning in the dashboard", function () {
        setupCandidateFixture({
          typeAccompagnement,
          status: "DOSSIER_DE_VALIDATION_SIGNALE",
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
            decision: "INCOMPLETE",
          },
        }).then((candidacy) => {
          setupGraphQLStubs(candidacy);
          loginAndWaitForQueries();

          cy.get('[data-testid="dossier-validation-tile"] button').should(
            "exist",
          );
          cy.get('[data-testid="incomplete-dv-banner"]').should("exist");
        });
      });

      it("should show a 'dossier de validation signalé' alert with date and reason if i open a signaled dossier de validation", function () {
        const signalDate = new Date("2025-09-01");
        const signalReason = "Le dossier de validation est illisible.";

        setupCandidateFixture({
          typeAccompagnement,
          status: "DOSSIER_DE_VALIDATION_SIGNALE",
          feasibilityDecision: "ADMISSIBLE",
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
            decision: "INCOMPLETE",
            decisionSentAt: signalDate.getTime(),
            decisionComment: signalReason,
          },
        }).then((candidate) => {
          setupGraphQLStubs(candidate, [
            "getCandidacyByIdForDossierDeValidationPage",
          ]);
          loginAndWaitForQueries();

          cy.get('[data-testid="dossier-validation-tile"] button').click();
          cy.wait("@getCandidacyByIdForDossierDeValidationPage");
          clickDossierTab();

          cy.get('[data-testid="dossier-de-validation-signale-alert"]').should(
            "exist",
          );
          cy.get(
            '[data-testid="dossier-de-validation-signale-alert"] .fr-alert__title',
          ).should(
            "contain",
            "Dossier de validation signalé par le certificateur le 01/09/2025",
          );
          cy.get('[data-testid="dossier-de-validation-signale-alert"]')
            .should("contain", "Motif du signalement :")
            .should("contain", signalReason);
        });
      });

      it("should show accordion with previous dossiers when there are multiple signalements", function () {
        const currentSignalDate = new Date("2024-03-20");
        const currentSignalReason = "Dernier commentaire";
        const previousSignalDate1 = new Date("2024-02-10");
        const previousSignalReason1 = "Premier commentaire";
        const previousSignalDate2 = new Date("2024-01-05");
        const previousSignalReason2 = "Deuxième commentaire";

        setupCandidateFixture({
          typeAccompagnement,
          status: "DOSSIER_DE_VALIDATION_SIGNALE",
          feasibilityDecision: "ADMISSIBLE",
          activeDossierDeValidation: {
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
          },
        }).then((candidacy) => {
          setupGraphQLStubs(candidacy, [
            "getCandidacyByIdForDossierDeValidationPage",
          ]);
          loginAndWaitForQueries();

          cy.get('[data-testid="dossier-validation-tile"] button').click();
          cy.wait("@getCandidacyByIdForDossierDeValidationPage");
          clickDossierTab();

          cy.get('[data-testid="dossier-de-validation-signale-alert"]').should(
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

      failedJuryResults.forEach((result) =>
        it(`should display certificateur comment and date when jury has a ${result}`, function () {
          const informationOfResult = "Lorem ipsum failorum";
          const dateOfSession = addDays(DATE_NOW, -30);
          const dateOfResult = addDays(DATE_NOW, -30);

          setupCandidateFixture({
            typeAccompagnement,
            status: "DOSSIER_DE_VALIDATION_ENVOYE",
            juryResult: result,
            juryInfo: {
              informationOfResult,
              dateOfResult: dateOfResult.getTime(),
              dateOfSession: dateOfSession.getTime(),
            },
            activeDossierDeValidation: { dossierDeValidationOtherFiles: [] },
          }).then((candidacy) => {
            setupGraphQLStubs(candidacy, [
              "getCandidacyByIdForDossierDeValidationPage",
            ]);
            loginAndWaitForQueries();
            navigateToDossierValidation(candidacy.data.getCandidacyById.id);
            clickDossierTab();

            cy.get(".fr-alert--info .fr-alert__title").should(
              "contain",
              format(dateOfResult, "dd/MM/yyyy"),
            );
            cy.get(".fr-alert--info").should("contain", informationOfResult);
          });
        }),
      );

      it(`should not display certificateur info when jury is FULL_SUCCESS_OF_FULL_CERTIFICATION`, function () {
        const informationOfResult = "Lorem ipsum";
        const dateOfSession = addDays(DATE_NOW, -30);
        const dateOfResult = addDays(DATE_NOW, -30);

        setupCandidateFixture({
          typeAccompagnement,
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          juryResult: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
          juryInfo: {
            informationOfResult,
            dateOfResult: dateOfResult.getTime(),
            dateOfSession: dateOfSession.getTime(),
          },
          activeDossierDeValidation: { dossierDeValidationOtherFiles: [] },
        }).then((candidacy) => {
          setupGraphQLStubs(candidacy, [
            "getCandidacyByIdForDossierDeValidationPage",
          ]);
          loginAndWaitForQueries();
          navigateToDossierValidation(candidacy.data.getCandidacyById.id);
          clickDossierTab();

          cy.get(".fr-alert--info").should("not.exist");
        });
      });

      failedJuryResults.forEach((juryResult) => {
        it(`should show active dossier de validation when jury result is ${juryResult}`, function () {
          setupCandidateFixture({
            typeAccompagnement,
            juryResult,
          }).then((candidacy) => {
            setupGraphQLStubs(candidacy, [
              "getCandidacyByIdForDossierDeValidationPage",
            ]);
            loginAndWaitForQueries();

            cy.get('[data-testid="dossier-validation-tile"] button').should(
              "not.be.disabled",
            );
            cy.get('[data-testid="dossier-validation-badge-to-send"]').should(
              "exist",
            );
          });
        });
      });

      it("should display accordion with the last submitted dossier when jury has failed and only the last one", function () {
        const dateOfSession = addDays(DATE_NOW, -30);
        const dateOfResult = addDays(DATE_NOW, -30);
        const dossierSentDate = addDays(DATE_NOW, -45);
        const informationOfResult = "Lorem ipsum failorum";

        const incompleteDV1Date = addDays(DATE_NOW, -120);
        const incompleteDV2Date = addDays(DATE_NOW, -90);

        setupCandidateFixture({
          typeAccompagnement,
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          juryResult: "FAILURE",
          juryInfo: {
            informationOfResult,
            dateOfResult: dateOfResult.getTime(),
            dateOfSession: dateOfSession.getTime(),
          },
          activeDossierDeValidation: {
            dossierDeValidationSentAt: dossierSentDate.getTime(),
            dossierDeValidationFile: {
              name: "dossier-validation-final.pdf",
              previewUrl: "https://example.com/dossier-final.pdf",
            },
            dossierDeValidationOtherFiles: [
              {
                name: "annexe1.pdf",
                previewUrl: "https://example.com/annexe1.pdf",
              },
              {
                name: "annexe2.jpg",
                previewUrl: "https://example.com/annexe2.jpg",
              },
            ],
            history: [
              {
                id: "dossier-incomplete-1",
                decisionSentAt: incompleteDV1Date.getTime(),
                decisionComment: "comment 1",
              },
              {
                id: "dossier-incomplete-2",
                decisionSentAt: incompleteDV2Date.getTime(),
                decisionComment: "comment 2",
              },
            ],
          },
        }).then((candidacy) => {
          setupGraphQLStubs(candidacy, [
            "getCandidacyByIdForDossierDeValidationPage",
          ]);
          loginAndWaitForQueries();
          navigateToDossierValidation(candidacy.data.getCandidacyById.id);
          clickDossierTab();

          cy.get(".fr-accordion").should(
            "contain",
            "Voir le dernier dossier soutenu devant le jury",
          );

          cy.get(".fr-accordion__btn").click();

          cy.get(".fr-accordion .fr-collapse")
            .should(
              "contain",
              `Dossier déposé le ${format(dossierSentDate, "dd/MM/yyyy")}`,
            )
            .should("contain", "Soutenu devant le jury le :")
            .should("contain", format(dateOfResult, "dd/MM/yyyy"))
            .should("contain", "Contenu du dossier :")
            .should("contain", "dossier-validation-final.pdf")
            .should("contain", "annexe1.pdf")
            .should("contain", "annexe2.jpg");

          cy.get(".fr-accordion .fr-collapse").should("have.length", 1);
        });
      });

      it("should not display accordion when jury has failed result but no dossier was sent", function () {
        const dateOfSession = addDays(DATE_NOW, -30);
        const dateOfResult = addDays(DATE_NOW, -30);

        setupCandidateFixture({
          typeAccompagnement,
          status: "DOSSIER_DE_VALIDATION_ENVOYE",
          juryResult: "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
          juryInfo: {
            informationOfResult: "Partial success",
            dateOfResult: dateOfResult.getTime(),
            dateOfSession: dateOfSession.getTime(),
          },
          activeDossierDeValidation: {
            dossierDeValidationOtherFiles: [],
          },
        }).then((candidacy) => {
          setupGraphQLStubs(candidacy, [
            "getCandidacyByIdForDossierDeValidationPage",
          ]);
          loginAndWaitForQueries();
          navigateToDossierValidation(candidacy.data.getCandidacyById.id);
          clickDossierTab();

          cy.get(".fr-alert--info").should("exist");

          cy.get(".fr-accordions-group").should("not.exist");
          cy.get(".fr-accordion").should("not.exist");
        });
      });
    });

    context("Resources Section", () => {
      it("should display resources section with PDF template download", function () {
        setupCandidateFixture({
          typeAccompagnement,
          status: "DOSSIER_FAISABILITE_RECEVABLE",
          readyForJuryEstimatedAt: ESTIMATED_DATE,
          additionalInfo: {
            dossierDeValidationTemplate: {
              name: "Trame_Dossier_Validation.pdf",
              previewUrl: "https://example.com/template.pdf",
              mimeType: "application/pdf",
              url: "https://example.com/template.pdf",
            },
            dossierDeValidationLink: null,
          },
        }).then((candidacy) => {
          setupGraphQLStubs(candidacy, [
            "getCandidacyByIdForDossierDeValidationPage",
          ]);
          loginAndWaitForQueries();
          navigateToDossierValidation(candidacy.data.getCandidacyById.id);
          clickDossierTab();

          cy.get("aside").should("contain", "Trame du dossier de validation");
          cy.get("aside")
            .find("a[href='https://example.com/template.pdf'][target='_blank']")
            .should("exist");
        });
      });

      it("should display resources section with URL template link", function () {
        setupCandidateFixture({
          typeAccompagnement,
          status: "DOSSIER_FAISABILITE_RECEVABLE",
          readyForJuryEstimatedAt: ESTIMATED_DATE,
          additionalInfo: {
            dossierDeValidationTemplate: null,
            dossierDeValidationLink: "https://example.com/template-link",
          },
        }).then((candidacy) => {
          setupGraphQLStubs(candidacy, [
            "getCandidacyByIdForDossierDeValidationPage",
          ]);
          loginAndWaitForQueries();
          navigateToDossierValidation(candidacy.data.getCandidacyById.id);
          clickDossierTab();

          cy.get("aside").should("contain", "Ressources :");
          cy.get("aside")
            .find(
              "a[href='https://example.com/template-link'][target='_blank']",
            )
            .should("exist");
          cy.get("aside").should("contain", "Trame du dossier de validation");
        });
      });

      it("should display resources section without template when no template is provided", function () {
        setupCandidateFixture({
          typeAccompagnement,
          status: "DOSSIER_FAISABILITE_RECEVABLE",
          readyForJuryEstimatedAt: ESTIMATED_DATE,
          additionalInfo: {
            dossierDeValidationTemplate: null,
            dossierDeValidationLink: null,
          },
        }).then((candidacy) => {
          setupGraphQLStubs(candidacy, [
            "getCandidacyByIdForDossierDeValidationPage",
          ]);
          loginAndWaitForQueries();
          navigateToDossierValidation(candidacy.data.getCandidacyById.id);
          clickDossierTab();

          cy.get("aside").should(
            "not.contain",
            "Trame du dossier de validation",
          );
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
});

context("File upload validation", () => {
  beforeEach(() => {
    setupCandidateFixture({
      typeAccompagnement: "AUTONOME",
      status: "DOSSIER_FAISABILITE_RECEVABLE",
    }).then((candidacy) => {
      setupGraphQLStubs(candidacy, [
        "getCandidacyByIdForDossierDeValidationPage",
      ]);
      loginAndWaitForQueries();
      navigateToDossierValidation(candidacy.data.getCandidacyById.id);
      clickDossierTab();
    });
  });

  it("should display an error when uploading a file with wrong format", function () {
    uploadFile(
      ".dossier-de-validation-file-upload > .fr-upload-group > input",
      "wrong-format.txt",
      "file contents",
      "text/plain",
    );
    cy.get('[data-testid="submit-dossier-de-validation-form-button"]').click();
    cy.get(".dossier-de-validation-file-upload .fr-error-text").should(
      "contain",
      "Le format de fichier n'est pas supporté. Essayez avec un .jpg, .png ou .pdf.",
    );
  });

  it("should display an error when uploading a file that is too large", function () {
    const largeContent = new Array(11 * 1024 * 1024).join("a");

    uploadFile(
      ".dossier-de-validation-file-upload > .fr-upload-group > input",
      "large-file.pdf",
      largeContent,
      "application/pdf",
    );
    cy.get('[data-testid="submit-dossier-de-validation-form-button"]').click();

    cy.get(".dossier-de-validation-file-upload .fr-error-text").should(
      "contain",
      "Le fichier que vous tentez d’envoyer est trop volumineux. Veuillez soumettre un fichier d’une taille inférieur à 10Mo.",
    );
  });

  it("should accept valid PDF files", function () {
    uploadFile(
      ".dossier-de-validation-file-upload > .fr-upload-group > input",
      "valid-document.pdf",
      "valid pdf content",
      "application/pdf",
    );
    cy.get('[data-testid="submit-dossier-de-validation-form-button"]').click();
    cy.get(".dossier-de-validation-file-upload .fr-error-text").should(
      "not.exist",
    );
  });
});
