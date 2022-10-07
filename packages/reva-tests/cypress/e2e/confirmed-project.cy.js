import { setDeviceId } from "../utils/device";
import { stubQuery } from "../utils/graphql";

context("Project", () => {
  beforeEach(() => {
    setDeviceId();
  });

  it("attempt to validate project", function () {
    cy.intercept("POST", "/graphql", (req) => {
      req.on("response", (res) => {
        res.setThrottle(1000);
      });
      stubQuery(req, "candidate_confirmRegistration", "candidate-logged.json");
    });
    cy.visit("/confirmation");
    cy.get('[data-test="project-home-loading"]');
    cy.wait("@candidate_confirmRegistration");

    cy.get('[data-test="project-home-ready"]');
  });
});
