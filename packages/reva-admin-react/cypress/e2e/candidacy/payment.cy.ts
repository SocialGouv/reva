import { sub } from "date-fns";

import { stubQuery } from "../../utils/graphql";

function visitPayment({
  dropOutCreationDate,
  proofReceivedByAdmin,
}: {
  dropOutCreationDate?: Date;
  proofReceivedByAdmin?: boolean;
}) {
  cy.fixture("candidacy/candidacy-drop-out-payment.json").then(
    (candidacyDroppedOut) => {
      if (dropOutCreationDate) {
        candidacyDroppedOut.data.getCandidacyById.candidacyDropOut.createdAt =
          dropOutCreationDate;
        candidacyDroppedOut.data.getCandidacyById.candidacyDropOut.proofReceivedByAdmin =
          proofReceivedByAdmin;
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

        stubQuery(
          req,
          "getCandidacyForPaymentRequestUnifvaeInvoicePage",
          candidacyDroppedOut,
        );

        stubQuery(
          req,
          "getCandidacyMenuAndCandidateInfos",
          "candidacy/candidacy-drop-out-menu.json",
        );
      });
    },
  );

  cy.collaborateur(
    "/candidacies/46206f6b-0a59-4478-9338-45e3a8d968e4/payment/unifvae/invoice/",
  );
}

const fourMonthsAgo = sub(new Date(), { months: 4 });
const fourMonthsAgoMinusOneMinute = sub(new Date(), { months: 4, minutes: -1 });

context("Payment form", () => {
  it("display a 'not available' alert when dropped-out less than 4 month ago", function () {
    visitPayment({
      dropOutCreationDate: fourMonthsAgoMinusOneMinute,
      proofReceivedByAdmin: false,
    });
    cy.wait("@getCandidacyForPaymentRequestUnifvaeInvoicePage");
    cy.get('[data-testid="payment-request-not-available"]').should("exist");
  });

  it("do not display any alert when dropped-out 4 month ago", function () {
    visitPayment({
      dropOutCreationDate: fourMonthsAgo,
      proofReceivedByAdmin: false,
    });
    cy.wait("@getCandidacyForPaymentRequestUnifvaeInvoicePage");
    // Make sure the form is ready before testing non-existence of the alert
    cy.get('[data-testid="payment-form"]').should("exist");
    cy.get('[data-testid="payment-request-not-available"]').should("not.exist");
  });

  it("do not display any alert when has not dropped-out", function () {
    visitPayment({});
    cy.wait("@getCandidacyForPaymentRequestUnifvaeInvoicePage");
    // Make sure the form is ready before testing non-existence of the alert
    cy.get('[data-testid="payment-form"]').should("exist");
    cy.get('[data-testid="payment-request-not-available"]').should("not.exist");
  });

  it("do not display any alert when dropped-out less than 4 month ago but with proof received by admin", function () {
    visitPayment({
      dropOutCreationDate: fourMonthsAgoMinusOneMinute,
      proofReceivedByAdmin: true,
    });
    cy.wait("@getCandidacyForPaymentRequestUnifvaeInvoicePage");
    // Make sure the form is ready before testing non-existence of the alert
    cy.get('[data-testid="payment-form"]').should("exist");
    cy.get('[data-testid="payment-request-not-available"]').should("not.exist");
  });
});
