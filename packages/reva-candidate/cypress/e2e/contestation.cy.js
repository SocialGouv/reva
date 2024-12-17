import { addDays, format, subDays } from "date-fns";
import { stubMutation, stubQuery } from "../utils/graphql";

const ACTUALISATION_FEATURE = "candidacy_actualisation";
const CONTESTATION_REASON_INPUT =
  '[data-test="contestation-candidate-confirmation-checkbox"] textarea';
const DATE_INPUT = '[data-test="contestation-date-input"] input';
const SUBMIT_BUTTON = '[data-test="form-buttons"] button[type="submit"]';
const RESET_BUTTON = '[data-test="form-buttons"] button[type="reset"]';
const CONTINUE_BUTTON = '[data-test="contestation-continue-button"]';
const HAS_BEEN_CREATED_COMPONENT =
  '[data-test="contestation-has-been-created"]';

context("Contestation Page", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubMutation(req, "candidate_login", "candidate_login.json");
    });

    cy.fixture("candidate1.json").then((candidate) => {
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.readyForJuryEstimatedAt =
        null;
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
        "DOSSIER_DE_VALIDATION_SIGNALE";

      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "candidate_getCandidateWithCandidacy", candidate);
      });
    });

    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: [ACTUALISATION_FEATURE],
        },
      });
    });

    cy.login();
    cy.wait("@candidate_login");
    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.visit("/contestation");
  });

  describe("Feature Flag Control", () => {
    it("should redirect to home when feature flag is disabled", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", {
          data: {
            activeFeaturesForConnectedUser: [],
          },
        });
      });

      cy.visit("/contestation");
      cy.url().should("not.include", "/contestation");
    });
  });

  describe("Form Validation", () => {
    it("should have submit button disabled until form is filled", () => {
      cy.get(SUBMIT_BUTTON).should("be.disabled");

      cy.get(CONTESTATION_REASON_INPUT).type("Raison de la contestation");
      cy.get(DATE_INPUT).type(format(addDays(new Date(), 1), "yyyy-MM-dd"));

      cy.get(SUBMIT_BUTTON).should("be.enabled");
    });

    it("should display validation error on date input when only reason is filled", () => {
      cy.get(CONTESTATION_REASON_INPUT).type("Raison de la contestation");
      cy.get(SUBMIT_BUTTON).click();

      cy.get(DATE_INPUT).should("have.class", "fr-input--error");
    });

    it("should display validation error on reason when only date is filled", () => {
      cy.get(DATE_INPUT).type(format(addDays(new Date(), 1), "yyyy-MM-dd"));
      cy.get(SUBMIT_BUTTON).click();

      cy.get(CONTESTATION_REASON_INPUT).should("have.class", "fr-input--error");
    });

    it("should display error when selecting past date", () => {
      const pastDate = subDays(new Date(), 1);

      cy.get(CONTESTATION_REASON_INPUT).type("Raison de la contestation");
      cy.get(DATE_INPUT).type(format(pastDate, "yyyy-MM-dd"));
      cy.get(SUBMIT_BUTTON).click();

      cy.get(DATE_INPUT).should("have.class", "fr-input--error");
    });
  });

  describe("Form Submission", () => {
    const futureDate = addDays(new Date(), 30);

    it("should successfully submit form with valid data", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        if (req.body.operationName === "createContestation") {
          req.reply({
            data: {
              candidacy_createContestation: {
                id: "test-id",
                readyForJuryEstimatedAt: futureDate.getTime(),
              },
            },
          });
        }
      }).as("createContestation");

      cy.get(CONTESTATION_REASON_INPUT).type("Raison de la contestation");
      cy.get(DATE_INPUT).type(format(futureDate, "yyyy-MM-dd"));
      cy.get(SUBMIT_BUTTON).click();

      cy.wait("@createContestation");

      cy.get(HAS_BEEN_CREATED_COMPONENT).should("be.visible");
      cy.get(CONTINUE_BUTTON).should("be.visible");
    });

    it("should display error message when API request fails", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        if (req.body.operationName === "createContestation") {
          req.reply({
            errors: [{ message: "Une erreur est survenue" }],
          });
        }
      }).as("createContestation");

      cy.get(CONTESTATION_REASON_INPUT).type("Raison de la contestation");
      cy.get(DATE_INPUT).type(format(futureDate, "yyyy-MM-dd"));
      cy.get(SUBMIT_BUTTON).click();

      cy.wait("@createContestation");

      cy.contains("Une erreur est survenue").should("be.visible");
    });
  });

  describe("Form Reset", () => {
    it("should reset form to initial values when clicking reset button", () => {
      const futureDate = addDays(new Date(), 30);

      cy.get(CONTESTATION_REASON_INPUT).type("Raison de la contestation");
      cy.get(DATE_INPUT).type(format(futureDate, "yyyy-MM-dd"));
      cy.get(RESET_BUTTON).click();

      cy.get(CONTESTATION_REASON_INPUT).should("have.value", "");
      cy.get(DATE_INPUT).should("have.value", "");
    });
  });
});
