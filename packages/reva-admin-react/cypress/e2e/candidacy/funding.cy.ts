import { stubQuery } from "../../utils/graphql";
import { sub } from "date-fns";

function visitFunding({ dropOutCreationDate }: { dropOutCreationDate?: Date }) {
  cy.fixture("candidacy/candidacy-drop-out-funding.json").then(
    (candidacyDroppedOut) => {
      if (dropOutCreationDate) {
        candidacyDroppedOut.data.getCandidacyById.candidacyDropOut.createdAt =
          dropOutCreationDate;
      } else {
        delete candidacyDroppedOut.data.getCandidacyById.candidacyDropOut;
      }

      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "activeFeaturesForConnectedUser",
          "features/active-features.json",
        );
        stubQuery(
          req,
          "getOrganismForAAPVisibilityCheck",
          "visibility/admin.json",
        );
        stubQuery(req, "getAccountInfo", "account/admin-info.json");

        stubQuery(req, "getCandidacyByIdFunding", candidacyDroppedOut);

        stubQuery(
          req,
          "getCandidacyMenuAndCandidateInfos",
          "candidacy/candidacy-drop-out-menu.json",
        );
      });
    },
  );

  cy.agency("/candidacies/46206f6b-0a59-4478-9338-45e3a8d968e4/funding");
}

const sixMonthsAgo = sub(new Date(), { months: 6 });
const sixMonthsAgoMinusOneMinute = sub(new Date(), { months: 6, minutes: -1 });

context("Funding form", () => {
  it("display a 'not available' alert when dropped-out less than 6 month ago", function () {
    visitFunding({ dropOutCreationDate: sixMonthsAgoMinusOneMinute });
    cy.wait("@getCandidacyByIdFunding");
    cy.get('[data-test="funding-request-not-available"]').should("exist");
  });

  it("do not display any alert when dropped-out 6 month ago", function () {
    visitFunding({ dropOutCreationDate: sixMonthsAgo });
    cy.wait("@getCandidacyByIdFunding");
    // Make sure the form is ready before testing non-existence of the alert
    cy.get('[data-test="funding-form"]').should("exist");
    cy.get('[data-test="funding-request-not-available"]').should("not.exist");
  });

  it("do not display any alert when has not dropped-out", function () {
    visitFunding({});
    cy.wait("@getCandidacyByIdFunding");
    // Make sure the form is ready before testing non-existence of the alert
    cy.get('[data-test="funding-form"]').should("exist");
    cy.get('[data-test="funding-request-not-available"]').should("not.exist");
  });
});
