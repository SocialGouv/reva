import { addDays, addWeeks, format, subDays, subMonths } from "date-fns";
import { stubQuery } from "../utils/graphql";

const ACTUALISATION_FEATURE = "candidacy_actualisation";
const CANDIDATE_CONFIRMATION_CHECKBOX =
  '[data-test="actualisation-candidate-confirmation-checkbox"] input[type="checkbox"]';
const DATE_INPUT = '[data-test="actualisation-date-input"] input';
const SUBMIT_BUTTON = '[data-test="form-buttons"] button[type="submit"]';
const RESET_BUTTON = '[data-test="form-buttons"] button[type="reset"]';
const CONTINUE_BUTTON = '[data-test="actualisation-continue-button"]';
const HAS_BEEN_UPDATED_COMPONENT =
  '[data-test="actualisation-has-been-updated"]';
context.skip("Actualisation Page", () => {
  beforeEach(() => {
    cy.fixture("candidate1.json").then((candidate) => {
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.isCaduque = true;
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.lastActivityDate =
        addWeeks(subMonths(new Date(), 6), 2).getTime();
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.status =
        "DOSSIER_DE_VALIDATION_SIGNALE";
      candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
        {
          decision: "ADMISSIBLE",
        };

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

    cy.wait("@candidate_getCandidateWithCandidacy");
    cy.wait("@activeFeaturesForConnectedUser");

    cy.visit("/actualisation");
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

      cy.visit("/actualisation");
      cy.url().should("not.include", "/actualisation");
    });
  });

  describe("Form Validation", () => {
    it("should have submit button disabled until form is filled", () => {
      cy.get(SUBMIT_BUTTON).should("be.disabled");

      cy.get(CANDIDATE_CONFIRMATION_CHECKBOX).check({ force: true });
      cy.get(DATE_INPUT).type(format(addDays(new Date(), 1), "yyyy-MM-dd"));

      cy.get(SUBMIT_BUTTON).should("be.enabled");
    });

    it("should display validation error on date input when only checkbox is checked", () => {
      cy.get(CANDIDATE_CONFIRMATION_CHECKBOX).check({ force: true });
      cy.get(SUBMIT_BUTTON).click();

      cy.get(DATE_INPUT).should("have.class", "fr-input--error");
    });

    it("should display validation error on checkbox when only date is filled", () => {
      cy.get(DATE_INPUT).type(format(addDays(new Date(), 1), "yyyy-MM-dd"));
      cy.get(SUBMIT_BUTTON).click();

      cy.get(
        '[data-test="actualisation-candidate-confirmation-checkbox"]',
      ).should("have.class", "fr-fieldset--error");
    });

    it("should display error when selecting past date", () => {
      const pastDate = subDays(new Date(), 1);

      cy.get(CANDIDATE_CONFIRMATION_CHECKBOX).check({ force: true });
      cy.get(DATE_INPUT).type(format(pastDate, "yyyy-MM-dd"));
      cy.get(SUBMIT_BUTTON).click();

      cy.get(DATE_INPUT).should("have.class", "fr-input--error");
    });
  });

  describe("Form Submission", () => {
    const futureDate = addDays(new Date(), 30);

    it("should successfully submit form with valid data", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        if (req.body.operationName === "updateLastActivityDate") {
          req.reply({
            data: {
              candidacy_updateLastActivityDate: {
                id: "test-id",
                lastActivityDate: futureDate.getTime(),
              },
            },
          });
        }
      }).as("updateLastActivityDate");

      cy.get(CANDIDATE_CONFIRMATION_CHECKBOX).check({ force: true });
      cy.get(DATE_INPUT).type(format(futureDate, "yyyy-MM-dd"));
      cy.get(SUBMIT_BUTTON).click();

      cy.wait("@updateLastActivityDate");

      cy.get(HAS_BEEN_UPDATED_COMPONENT).should("be.visible");
      cy.get(CONTINUE_BUTTON).should("be.visible");
    });

    it("should display error message when API request fails", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        if (req.body.operationName === "updateLastActivityDate") {
          req.reply({
            errors: [{ message: "Une erreur est survenue" }],
          });
        }
      }).as("updateLastActivityDate");

      cy.get(CANDIDATE_CONFIRMATION_CHECKBOX).check({ force: true });
      cy.get(DATE_INPUT).type(format(futureDate, "yyyy-MM-dd"));
      cy.get(SUBMIT_BUTTON).click();

      cy.wait("@updateLastActivityDate");

      cy.contains("Une erreur est survenue").should("be.visible");
    });
  });

  describe("Form Reset", () => {
    it("should reset form to initial values when clicking reset button", () => {
      const futureDate = addDays(new Date(), 30);

      cy.get(CANDIDATE_CONFIRMATION_CHECKBOX).check({ force: true });
      cy.get(DATE_INPUT).type(format(futureDate, "yyyy-MM-dd"));
      cy.get(RESET_BUTTON).click();

      cy.get(CANDIDATE_CONFIRMATION_CHECKBOX).should("not.be.checked");
      cy.get(DATE_INPUT).should("have.value", "");
    });
  });
});
