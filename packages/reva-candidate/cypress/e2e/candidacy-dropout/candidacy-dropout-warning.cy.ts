import { stubMutation, stubQuery } from "../../utils/graphql";
import candidateDropOut from "./fixtures/candidate-dropped-out.json";
import { subMonths } from "date-fns";

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
                  createdAt: dropOutDate
                    ? dropOutDate.toJSON()
                    : new Date().toJSON(),
                  proofReceivedByAdmin,
                  dropOutConfirmedByCandidate,
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
        context("And it has been less than 6 months since the drop out", () => {
          it("should show the warning when the drop out has not been confirmed", function () {
            interceptCandidacy({ droppedOut: true });
            cy.login();
            cy.wait("@candidate_login");
            cy.wait("@candidate_getCandidateWithCandidacy");
            cy.wait("@activeFeaturesForConnectedUser");

            cy.get('[data-test="drop-out-warning"]').should("exist");
          });

          it("should let me click the decision button and lead me to the decision page", function () {
            interceptCandidacy({ droppedOut: true });
            cy.login();
            cy.wait("@candidate_login");
            cy.wait("@candidate_getCandidateWithCandidacy");
            cy.wait("@activeFeaturesForConnectedUser");

            cy.get('[data-test="drop-out-warning-decision-button"]').click();
            cy.url().should(
              "eq",
              "http://localhost:3004/candidat/candidacy-dropout-decision/",
            );
          });

          context("And a drop out proof has been given by the aap", () => {
            it("should not show the decision button", function () {
              interceptCandidacy({
                droppedOut: true,
                proofReceivedByAdmin: true,
              });
              cy.login();
              cy.wait("@candidate_login");
              cy.wait("@candidate_getCandidateWithCandidacy");
              cy.wait("@activeFeaturesForConnectedUser");
              cy.get('[data-test="drop-out-warning"]').should("exist");
              cy.get('[data-test="drop-out-warning-decision-button"]').should(
                "not.exist",
              );
            });
          });
          context(
            "And the drop out has been confirmed by the candidate",
            () => {
              it("should not show the decision button", function () {
                interceptCandidacy({
                  droppedOut: true,
                  dropOutConfirmedByCandidate: true,
                });
                cy.login();
                cy.wait("@candidate_login");
                cy.wait("@candidate_getCandidateWithCandidacy");
                cy.wait("@activeFeaturesForConnectedUser");
                cy.get('[data-test="drop-out-warning"]').should("exist");
                cy.get('[data-test="drop-out-warning-decision-button"]').should(
                  "not.exist",
                );
              });
            },
          );
        });
        context("And it has been more than 6 months since the drop out", () => {
          it("should not show the decision button", function () {
            interceptCandidacy({
              droppedOut: true,
              dropOutDate: subMonths(new Date(), 6),
            });
            cy.login();
            cy.wait("@candidate_login");
            cy.wait("@candidate_getCandidateWithCandidacy");
            cy.wait("@activeFeaturesForConnectedUser");
            cy.get('[data-test="drop-out-warning"]').should("exist");
            cy.get('[data-test="drop-out-warning-decision-button"]').should(
              "not.exist",
            );
          });
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
