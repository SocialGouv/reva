import { CandidacyStatusStep } from "@/graphql/generated/graphql";

import { stubQuery } from "../../utils/graphql";

function visitCertificationDetails({
  candidacyStatus,
  userProfile,
  candidacyDropOut = null,
}: {
  candidacyStatus: CandidacyStatusStep;
  userProfile: "admin" | "aap";
  candidacyDropOut?: { id: string; createdAt: string } | null;
}) {
  cy.fixture("candidacy/candidacy.json").then((candidacy) => {
    cy.fixture("certification/certification-details.json").then(
      (certification) => {
        candidacy.data.getCandidacyById.status = candidacyStatus;
        candidacy.data.getCandidacyById.candidacyDropOut = candidacyDropOut;

        cy.intercept("POST", "/api/graphql", (req) => {
          stubQuery(req, "activeFeaturesForConnectedUser", {
            data: {
              activeFeaturesForConnectedUser: [],
            },
          });

          stubQuery(
            req,
            "getOrganismForAAPVisibilityCheck",
            "visibility/admin.json",
          );
          stubQuery(req, "getAccountInfo", "account/admin-info.json");
          stubQuery(
            req,
            "getCertificationForCertificationDetailsPage",
            certification,
          );
          stubQuery(req, "getCandidacyForCertificationDetailsPage", candidacy);
        });
      },
    );
  });

  const url = "/certification-details/cert-123?candidacyId=candidacy-123";
  if (userProfile === "admin") {
    cy.admin(url);
  } else if (userProfile === "aap") {
    cy.collaborateur(url);
  }
}

describe("Certification change button visibility", () => {
  const allowedStatuses: CandidacyStatusStep[] = [
    "PRISE_EN_CHARGE",
    "PARCOURS_ENVOYE",
    "PARCOURS_CONFIRME",
    "DOSSIER_FAISABILITE_INCOMPLET",
  ];

  const notAllowedStatuses: CandidacyStatusStep[] = [
    "PROJET",
    "VALIDATION",
    "DOSSIER_FAISABILITE_ENVOYE",
    "DOSSIER_FAISABILITE_RECEVABLE",
    "DOSSIER_FAISABILITE_NON_RECEVABLE",
    "DOSSIER_FAISABILITE_COMPLET",
    "DOSSIER_DE_VALIDATION_ENVOYE",
    "DOSSIER_DE_VALIDATION_SIGNALE",
  ];

  (["admin", "aap"] as const).forEach((userProfile) => {
    context(`${userProfile} user`, () => {
      allowedStatuses.forEach((status) => {
        it(`should show the change certification button when status is ${status}`, () => {
          visitCertificationDetails({
            candidacyStatus: status,
            userProfile,
          });

          cy.get('[data-test="candidacy-change-certification-button"]').should(
            "exist",
          );
        });
      });

      notAllowedStatuses.forEach((status) => {
        it.only(`should NOT show the change certification button when status is ${status}`, () => {
          visitCertificationDetails({
            candidacyStatus: status,
            userProfile,
          });

          cy.get('[data-test="certification-description-card"]').should(
            "exist",
          );

          cy.get('[data-test="candidacy-change-certification-button"]').should(
            "not.exist",
          );
        });
      });

      it("should NOT show the change certification button when candidacy is dropped out", () => {
        visitCertificationDetails({
          candidacyStatus: "PRISE_EN_CHARGE",
          userProfile,
          candidacyDropOut: {
            id: "drop-out-123",
            createdAt: "2024-01-01",
          },
        });

        cy.get('[data-test="candidacy-change-certification-button"]').should(
          "not.exist",
        );
      });
    });
  });
});
