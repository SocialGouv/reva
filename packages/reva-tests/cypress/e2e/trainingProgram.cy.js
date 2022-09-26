import { setDeviceId } from "../utils/device";
import { stubQuery } from "../utils/graphql";

context("Project", () => {
    beforeEach(() => {
        setDeviceId();
    });

    it("validates checked condition and its mechanics", function () {
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
});
