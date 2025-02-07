import { stubQuery } from "../../utils/graphql";

function visitGeneralInformation({
  statutValidation = "A_JOUR",
  dateFermeture = null,
  isAttestationReferencementActive = false,
  qualiopiStatus = true,
  siegeSocial = true,
}: {
  statutValidation?: string;
  dateFermeture?: string | null;
  isAttestationReferencementActive?: boolean;
  qualiopiStatus?: boolean;
  siegeSocial?: boolean;
}) {
  cy.fixture("features/active-features.json").then((activeFeatures) => {
    activeFeatures.data.activeFeaturesForConnectedUser =
      isAttestationReferencementActive
        ? [
            ...activeFeatures.data.activeFeaturesForConnectedUser,
            "attestation_referencement",
          ]
        : activeFeatures.data.activeFeaturesForConnectedUser;

    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "getMaisonMereCGUQuery",
        "account/gestionnaire-cgu-accepted.json",
      );
      stubQuery(req, "activeFeaturesForConnectedUser", activeFeatures);
      stubQuery(req, "getOrganismForAAPVisibilityCheck", {
        account_getAccountForConnectedUser: {
          organism: {
            id: "0415e62b-cb2e-4251-b45b-eb0df9082b2d",
            isVisibleInCandidateSearchResults: true,
          },
        },
      });
      stubQuery(req, "getAccountInfo", "account/admin-info.json");
      stubQuery(req, "getAccountMaisonMereGeneralInformation", {
        data: {
          account_getAccountForConnectedUser: {
            maisonMereAAP: {
              id: "733540e0-1bb1-4b8d-a66d-97fc992ff522",
              siret: "82493729600021",
              phone: "0663530236",
              managerFirstname: null,
              managerLastname: null,
              statutValidationInformationsJuridiquesMaisonMereAAP:
                statutValidation,
              legalInformationDocumentsDecisions: [],
              gestionnaire: {
                firstname: "Thomas",
                lastname: "Maison Mere",
                email: "dosanjos.thomas+mm@gmail.com",
              },
            },
          },
        },
      });
      stubQuery(req, "getEtablissementForAgenciesSettings", {
        data: {
          getEtablissement: {
            siret: "82493729600021",
            raisonSociale: "THOMAS DOS ANJOS",
            formeJuridique: {
              code: "1000",
              libelle: "Entrepreneur individuel",
              legalStatus: "EI",
            },
            siegeSocial,
            dateFermeture,
            qualiopiStatus,
          },
        },
      });
    });
  });

  cy.gestionnaire(
    "/agencies-settings-v3/733540e0-1bb1-4b8d-a66d-97fc992ff522/general-information/",
  );

  cy.wait([
    "@getAccountMaisonMereGeneralInformation",
    "@getOrganismForAAPVisibilityCheck",
    "@getAccountInfo",
    "@getMaisonMereCGUQuery",
    "@activeFeaturesForConnectedUser",
    "@getEtablissementForAgenciesSettings",
  ]);
}

describe("General Information Page", () => {
  context("Company Status Indicators and Badges", () => {
    it("should display all active status badges for a fully compliant establishment", () => {
      visitGeneralInformation({
        siegeSocial: true,
        dateFermeture: null,
        qualiopiStatus: true,
      });

      cy.get('[data-test="siege-social-badge"]').should("exist");
      cy.get('[data-test="en-activite-badge"]').should("exist");
      cy.get('[data-test="qualiopi-actif-badge"]').should("exist");
    });

    it("should indicate secondary establishment status when not a headquarters", () => {
      visitGeneralInformation({
        siegeSocial: false,
      });

      cy.get('[data-test="etablissement-secondaire-badge"]').should("exist");
    });

    it("should show establishment closure status with specific closure date", () => {
      visitGeneralInformation({
        dateFermeture: "2023-12-31",
      });

      cy.get('[data-test="ferme-badge"]')
        .should("exist")
        .and("contain.text", "Fermé le 31/12/2023");
    });

    it("should indicate non-compliance when Qualiopi certification is missing", () => {
      visitGeneralInformation({
        qualiopiStatus: false,
      });

      cy.get('[data-test="qualiopi-inactif-badge"]').should("exist");
    });
  });

  context("Attestation de référencement", () => {
    it("should make attestation section visible when feature flag is enabled", () => {
      visitGeneralInformation({
        isAttestationReferencementActive: true,
      });
      cy.get('[data-test="download-attestation-referencement"]').should(
        "exist",
      );
    });

    const attestationDownloadTestCases = [
      {
        scenario: "establishment is active and account information is current",
        accountValidationStatus: "A_JOUR",
        establishmentClosingDate: null,
        isDownloadEnabled: true,
      },
      {
        scenario: "account information requires update",
        accountValidationStatus: "A_METTRE_A_JOUR",
        establishmentClosingDate: null,
        isDownloadEnabled: false,
      },
      {
        scenario: "establishment has ceased operations",
        accountValidationStatus: "A_JOUR",
        establishmentClosingDate: "2023-12-31",
        isDownloadEnabled: false,
      },
    ];

    attestationDownloadTestCases.forEach(
      ({
        scenario,
        accountValidationStatus,
        establishmentClosingDate,
        isDownloadEnabled,
      }) => {
        it(`should ${isDownloadEnabled ? "enable" : "disable"} attestation download and ${isDownloadEnabled ? "hide" : "display"} warning message when ${scenario}`, () => {
          visitGeneralInformation({
            statutValidation: accountValidationStatus,
            dateFermeture: establishmentClosingDate,
            isAttestationReferencementActive: true,
          });

          cy.get('[data-test="download-attestation-referencement"]').should(
            isDownloadEnabled ? "be.enabled" : "be.disabled",
          );

          if (!isDownloadEnabled) {
            cy.get('[data-test="attestation-referencement-warning"]')
              .should("be.visible")
              .and(
                "contain.text",
                "Vous ne pouvez pas générer d'attestation si votre compte n'est pas à jour ou si votre établissement a fermé.",
              );
          } else {
            cy.get('[data-test="attestation-referencement-warning"]').should(
              "not.exist",
            );
          }
        });
      },
    );
  });
});
