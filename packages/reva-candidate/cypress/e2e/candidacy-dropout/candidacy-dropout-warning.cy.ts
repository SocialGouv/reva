import { subMonths } from "date-fns";

import candidate1Data from "../../fixtures/candidate1.json";
import { stubQuery } from "../../utils/graphql";

import candidacy1DropOut from "./fixtures/candidacy1-dropped-out.json";

const candidate = candidate1Data.data.candidate_getCandidateById;

function interceptCandidacy({
  droppedOut = false,
  proofReceivedByAdmin = false,
  dropOutConfirmedByCandidate = false,
  dropOutDate,
}: {
  droppedOut?: boolean;
  proofReceivedByAdmin?: boolean;
  dropOutConfirmedByCandidate?: boolean;
  dropOutDate?: Date;
}) {
  cy.intercept("POST", "/api/graphql", (req) => {
    const candidacy = {
      data: {
        getCandidacyById: {
          ...candidacy1DropOut.data.getCandidacyById,

          candidacyDropOut: droppedOut
            ? {
                createdAt: dropOutDate
                  ? dropOutDate.toJSON()
                  : new Date().toJSON(),
                proofReceivedByAdmin,
                dropOutConfirmedByCandidate,
              }
            : null,
        },
      },
    };

    const candidacies = {
      data: {
        candidate_getCandidateById: {
          candidacies: [candidacy.data.getCandidacyById],
        },
      },
    };

    stubQuery(
      req,
      "candidate_getCandidateForCandidatesGuard",
      "candidate1-for-candidates-guard.json",
    );
    stubQuery(req, "getCandidateByIdForCandidateGuard", candidate1Data);
    stubQuery(
      req,
      "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      candidacies,
    );

    stubQuery(req, "getCandidacyByIdForCandidacyGuard", candidacy);
    stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
    stubQuery(req, "getCandidacyByIdWithCandidate", candidacy);
    stubQuery(req, "getCandidacyByIdForDashboard", candidacy);
  });
  cy.login();

  cy.wait([
    "@candidate_getCandidateForCandidatesGuard",
    "@getCandidateByIdForCandidateGuard",
    "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
    "@activeFeaturesForConnectedUser",
    "@getCandidacyByIdForCandidacyGuard",
    "@getCandidacyByIdForDashboard",
  ]);
}

context("Candidacy dropout warning", () => {
  context("When the candidacy has  been dropped out", () => {
    context("And it has been less than 6 months since the drop out", () => {
      it("should redirect to candidacy dropout decision page when the drop out has not been confirmed", function () {
        interceptCandidacy({ droppedOut: true });

        cy.url().should(
          "eq",
          Cypress.config().baseUrl +
            `candidates/${candidate.id}/candidacies/c1/candidacy-dropout-decision/`,
        );
      });

      context("And a drop out proof has been given by the aap", () => {
        it("should not show the decision button", function () {
          interceptCandidacy({
            droppedOut: true,
            proofReceivedByAdmin: true,
          });

          cy.get('[data-testid="drop-out-warning"]').should("exist");
          cy.get('[data-testid="drop-out-warning-decision-button"]').should(
            "not.exist",
          );
        });
      });
      context("And the drop out has been confirmed by the candidate", () => {
        it("should not show the decision button", function () {
          interceptCandidacy({
            droppedOut: true,
            dropOutConfirmedByCandidate: true,
          });

          cy.get('[data-testid="drop-out-warning"]').should("exist");
          cy.get('[data-testid="drop-out-warning-decision-button"]').should(
            "not.exist",
          );
        });
      });
    });
    context("And it has been more than 6 months since the drop out", () => {
      it("should not show the decision button", function () {
        interceptCandidacy({
          droppedOut: true,
          dropOutDate: subMonths(new Date(), 6),
        });

        cy.get('[data-testid="drop-out-warning"]').should("exist");
        cy.get('[data-testid="drop-out-warning-decision-button"]').should(
          "not.exist",
        );
      });
    });
  });

  context("When the candidacy has not been dropped out", () => {
    it("should not show the warning", function () {
      interceptCandidacy({});

      cy.wait(["@getCandidacyByIdWithCandidate"]);

      cy.get('[data-testid="drop-out-warning"]').should("not.exist");
    });
  });
});
