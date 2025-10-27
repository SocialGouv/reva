import { addDays, addMonths, format } from "date-fns";

import {
  JuryResult,
  TypeAccompagnement,
  CandidacyStatusStep,
  FeasibilityDecision,
  DossierDeValidationDecision,
} from "@/graphql/generated/graphql";

import candidate1Data from "../fixtures/candidate1.json";
import { stubQuery } from "../utils/graphql";

const DATE_NOW = new Date();
const ESTIMATED_DATE = addMonths(DATE_NOW, 10);
const SENT_DATE = addDays(DATE_NOW, 15);

const candidate = candidate1Data.data.candidate_getCandidateById;

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
      "candidate_getCandidateForCandidatesGuard",
      "candidate1-for-candidates-guard.json",
    );
    stubQuery(req, "getCandidateByIdForCandidateGuard", candidate1Data);
    stubQuery(
      req,
      "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      "candidacies-with-candidacy-1.json",
    );
    allQueries.forEach((query) => {
      stubQuery(req, query, candidate);
    });
  });
}

function loginAndWaitForQueries(queryAliases: string[] = []) {
  const defaultAliases = [
    "@candidate_getCandidateForCandidatesGuard",
    "@getCandidateByIdForCandidateGuard",
    "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
    "@getCandidacyByIdForCandidacyGuard",
    "@getCandidacyByIdWithCandidate",
    "@getCandidacyByIdForDashboard",
  ];

  cy.login();
  cy.wait([...defaultAliases, ...queryAliases]);
}

function navigateToDossierValidation(candidacyId: string) {
  cy.visit(
    `/candidates/${candidate.id}/candidacies/${candidacyId}/dossier-de-validation/`,
  );
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
