import { stubQuery } from "../../utils/graphql";
import { sub } from "date-fns";

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

const sixMonthsAgo = sub(new Date(), { months: 6 });
const sixMonthsAgoMinusOneMinute = sub(new Date(), { months: 6, minutes: -1 });

context("Payment form", () => {
  it("display a 'not available' alert when dropped-out less than 6 month ago", function () {
    visitPayment({
      dropOutCreationDate: sixMonthsAgoMinusOneMinute,
      proofReceivedByAdmin: false,
    });
    cy.wait("@getCandidacyForPaymentRequestUnifvaeInvoicePage");
    cy.get('[data-test="payment-request-not-available"]').should("exist");
  });

  it("do not display any alert when dropped-out 6 month ago", function () {
    visitPayment({
      dropOutCreationDate: sixMonthsAgo,
      proofReceivedByAdmin: false,
    });
    cy.wait("@getCandidacyForPaymentRequestUnifvaeInvoicePage");
    // Make sure the form is ready before testing non-existence of the alert
    cy.get('[data-test="payment-form"]').should("exist");
    cy.get('[data-test="payment-request-not-available"]').should("not.exist");
  });

  it("do not display any alert when has not dropped-out", function () {
    visitPayment({});
    cy.wait("@getCandidacyForPaymentRequestUnifvaeInvoicePage");
    // Make sure the form is ready before testing non-existence of the alert
    cy.get('[data-test="payment-form"]').should("exist");
    cy.get('[data-test="payment-request-not-available"]').should("not.exist");
  });

  it("do not display any alert when dropped-out less than 6 month ago but with proof received by admin", function () {
    visitPayment({
      dropOutCreationDate: sixMonthsAgoMinusOneMinute,
      proofReceivedByAdmin: true,
    });
    cy.wait("@getCandidacyForPaymentRequestUnifvaeInvoicePage");
    // Make sure the form is ready before testing non-existence of the alert
    cy.get('[data-test="payment-form"]').should("exist");
    cy.get('[data-test="payment-request-not-available"]').should("not.exist");
  });
});
