import { stubMutation, stubQuery } from "../../utils/graphql";
import candidateDropOut from "./fixtures/candidate-dropped-out.json";

function interceptCandidacy({ droppedOut = false }: { droppedOut?: boolean }) {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubMutation(req, "candidate_login", "candidate_login.json");
    stubQuery(req, "candidate_getCandidateWithCandidacy", {
      data: {
        candidate_getCandidateWithCandidacy: {
          ...candidateDropOut.data.candidate_getCandidateWithCandidacy,
          candidacy: {
            ...candidateDropOut.data.candidate_getCandidateWithCandidacy
              .candidacy,
            candidacyDropOut: droppedOut
              ? {
                  createdAt: "2021-09-01T00:00:00Z",
                  dropOutConfirmedByCandidate: false,
                }
              : null,
          },
        },
      },
    });
    stubQuery(req, "activeFeaturesForConnectedUser", {
      data: {
        activeFeaturesForConnectedUser: [
          "CANDIDACY_DROP_OUT_CANDIDATE_CONFIRMATION",
        ],
      },
    });
  });
}

context("Candidacy dropout warning", () => {
  context(
    "When the CANDIDACY_DROP_OUT_CANDIDATE_CONFIRMATION feature is activated",
    () => {
      context("When the candidacy has  been dropped out", () => {
        it("should show the warning when the drop out has not been confirmed", function () {
          interceptCandidacy({ droppedOut: true });
          cy.login();
          cy.wait("@candidate_login");
          cy.wait("@candidate_getCandidateWithCandidacy");
          cy.wait("@activeFeaturesForConnectedUser");

          cy.get('[data-test="drop-out-warning"]').should("exist");
        });
      });
      context("When the candidacy has  not been dropped out", () => {
        it("should not show the warning", function () {
          interceptCandidacy({});
          cy.login();
          cy.wait("@candidate_login");
          cy.wait("@candidate_getCandidateWithCandidacy");
          cy.wait("@activeFeaturesForConnectedUser");
          cy.get('[data-test="project-home-ready"]').should("exist");
          cy.get('[data-test="drop-out-warning"]').should("not.exist");
        });
      });
    },
  );
});
