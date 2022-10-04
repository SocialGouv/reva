import { stubQuery } from "../utils/graphql";

context("Training Program", () => {
    describe('Testing Checkbox logic', () => {
        it("validates checked condition and its mechanics", () => {
            cy.intercept("POST", "/graphql", (req) => {
                stubQuery(req, "getCandidacy", "candidacy3.json");
            });
            cy.visit("/");
            cy.wait("@getCandidacy");

            cy.get('[data-test="created-at-date"]').should(
                "have.text",
                "Démarré le 28/09/2022"
            );
            cy.get('[data-test="progress-title-value"]').should(
                "have.text",
                "100%"
            );
            cy.get('[data-test="progress-100"]').should("exist");
            cy.get('[data-test="review-training-form"]').should("exist");
            cy.get('[data-test="ap-organism"]').should("exist");
            cy.get('[data-test="review-button"]').should("exist");
        });
    })
});
