import { stubQuery } from "../utils/graphql";

context("Training Program", () => {
    describe('Testing Descriptions', () => {
        it("display all fields", () => {
            cy.intercept("POST", "/graphql", (req) => {
                stubQuery(req, "getCandidacy", "getCandidacy3.json");
            });
            cy.visit("/");
            cy.wait("@getCandidacy");
            cy.get('dl').should("exist").should('have.length', 1)
            cy.get('dl > dt').should("exist").should('have.length', 8)
            cy.get('dl > dd').should("exist").should('have.length', 8)

        });

        it("don't display missing fields", () => {
            cy.intercept("POST", "/graphql", (req) => {
                stubQuery(req, "getCandidacy", "getCandidacy3_missingFields.json");
            });
            cy.visit("/");
            cy.wait("@getCandidacy");
            cy.get('dl').should("exist").should('have.length', 1)
            cy.get('dl > dt').should("exist").should('have.length', 4)
            cy.get('dl > dd').should("exist").should('have.length', 4)

        });
    })


    describe('Testing Checkbox logic', () => {
        it("validates checked condition and its mechanics", () => {
            cy.intercept("POST", "/graphql", (req) => {
                stubQuery(req, "getCandidacy", "getCandidacy3.json");
            });
            cy.visit("/");
            cy.wait("@getCandidacy");

            const checkbox = cy.get('[data-test="checkbox-accept-conditions"]');
            checkbox.should("exist").not('be.checked');
            cy.get('[data-test="label-accept-conditions"]').should("exist");

            const confirmBtn = cy.get('[data-test="submit-training"]');
            confirmBtn.should("exist").should('be.disabled');

            checkbox.check()
            confirmBtn.should("exist").should('be.enabled');
            confirmBtn.click()
        });
    })
});
