import { stubQuery } from "../utils/graphql";

context("Training Program", () => {
    describe('Testing Descriptions', () => {
        it("display all fields", () => {
            cy.intercept("POST", "/graphql", (req) => {
                stubQuery(req, "getCandidacy", "candidacy3.json");
            });
            cy.visit("/");
            cy.wait("@getCandidacy");
            cy.get('[data-test="description-list"]').should('have.length', 1)
            cy.get('[data-test="description-term"]').should('have.length', 8)
            cy.get('[data-test="description-details"]').should('have.length', 8)

        });

        it("don't display missing fields", () => {
            cy.intercept("POST", "/graphql", (req) => {
                stubQuery(req, "getCandidacy", "candidacy3_missingFields.json");
            });
            cy.visit("/");
            cy.wait("@getCandidacy");
            cy.get('[data-test="description-list"]').should('have.length', 1)
            cy.get('[data-test="description-term"]').should('have.length', 4)
            cy.get('[data-test="description-details"]').should('have.length', 4)

        });
    })


    describe('Testing Checkbox logic', () => {
        it("validates checked condition and its mechanics", () => {
            cy.intercept("POST", "/graphql", (req) => {
                stubQuery(req, "getCandidacy", "candidacy3.json");
                stubQuery(req, "candidacy_confirmTrainingForm", "confirm-training-form.json",);
            });
            cy.visit("/");
            cy.wait("@getCandidacy");

            cy.get('[data-test="checkbox-accept-conditions"]').as('$checkbox').not('be.checked');
            cy.get('[data-test="label-accept-conditions"]').should("exist");
            cy.get('[data-test="submit-training"]').as('$submit').should('be.disabled');
            cy.get('@$checkbox').check()
            cy.get('@$submit').should('be.enabled').click()
            cy.wait("@candidacy_confirmTrainingForm");

        });
    })
});
