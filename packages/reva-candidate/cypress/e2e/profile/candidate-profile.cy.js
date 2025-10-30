import { format } from "date-fns";

import { stubQuery } from "../../utils/graphql";

import candidacy1Data from "./fixtures/candidacy1.json";
import countries from "./fixtures/countries.json";
import departments from "./fixtures/departments.json";

// Form elements selectors
const SUBMIT_BUTTON = '[data-test="form-buttons"] button[type="submit"]';
const RESET_BUTTON = '[data-test="form-buttons"] button[type="reset"]';
const FIRSTNAME_INPUT = '[data-testid="firstname-input"] input';
const LASTNAME_INPUT = '[data-testid="lastname-input"] input';
const GIVEN_NAME_INPUT = '[data-testid="given-name-input"] input';
const FIRSTNAME2_INPUT = '[data-testid="firstname2-input"] input';
const FIRSTNAME3_INPUT = '[data-testid="firstname3-input"] input';
const GENDER_SELECT = '[data-testid="gender-select"] select';
const BIRTH_CITY_INPUT = '[data-testid="birth-city-input"] input';
const BIRTHDATE_INPUT = '[data-testid="birthdate-input"] input';
const BIRTH_DEPARTMENT_SELECT =
  '[data-testid="birth-department-select"] select';
const COUNTRY_SELECT = '[data-testid="country-select"] select';
const STREET_INPUT = '[data-testid="street-input"] input';
const CITY_INPUT = '[data-testid="city-input"] input';
const ZIP_INPUT = '[data-testid="zip-input"] input';
const PHONE_INPUT = '[data-testid="phone-input"] input';
const EMAIL_INPUT = '[data-testid="email-input"] input';
const ADDRESS_COMPLEMENT_INPUT =
  '[data-testid="address-complement-input"] input';

// CSS classes and status indicators
const ERROR_CLASS = "fr-input-group--error";
const TOAST_SUCCESS = '[data-testid="toast-success"]';
const TOAST_ERROR = '[data-testid="toast-error"]';

// Data constants
const FRANCE_COUNTRY_ID = "208ef9d1-4d18-475b-9f5f-575da5f7218c";

context("Candidate Profile Page", () => {
  const candidate = candidacy1Data.data.getCandidacyById.candidate;

  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-1.json",
      );
      stubQuery(req, "getCandidacyByIdForCandidacyGuard", "candidacy1.json");
      stubQuery(req, "activeFeaturesForConnectedUser", "features.json");
      stubQuery(req, "getCandidacyByIdWithCandidate", "candidacy1.json");
      stubQuery(req, "getCandidacyByIdForDashboard", "candidacy1.json");

      stubQuery(
        req,
        "getCandidacyByIdWithCandidateForProfilePage",
        candidacy1Data,
      );
      stubQuery(req, "getCountries", countries);
      stubQuery(req, "getDepartments", departments);
    });

    cy.login();
    cy.wait([
      "@candidate_getCandidateWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);
    cy.visit("/c1/profile");
    cy.wait([
      "@getDepartments",
      "@getCountries",
      "@getCandidacyByIdWithCandidateForProfilePage",
    ]);
  });

  describe("Profile Page Initial Loading", () => {
    it("should load candidate personal information correctly", () => {
      cy.get(FIRSTNAME_INPUT).should("have.value", candidate.firstname);
      cy.get(LASTNAME_INPUT).should("have.value", candidate.lastname);
      cy.get(GIVEN_NAME_INPUT).should("have.value", candidate.givenName);
      cy.get(FIRSTNAME2_INPUT).should("have.value", candidate.firstname2);
      cy.get(FIRSTNAME3_INPUT).should("have.value", candidate.firstname3);
      cy.get(GENDER_SELECT).should("have.value", candidate.gender);
      cy.get(BIRTH_CITY_INPUT).should("have.value", candidate.birthCity);
      cy.get(BIRTHDATE_INPUT).should(
        "have.value",
        format(new Date(candidate.birthdate), "yyyy-MM-dd"),
      );
      cy.get(STREET_INPUT).should("have.value", candidate.street);
      cy.get(CITY_INPUT).should("have.value", candidate.city);
      cy.get(ZIP_INPUT).should("have.value", candidate.zip);
      cy.get(PHONE_INPUT).should("have.value", candidate.phone);
      cy.get(EMAIL_INPUT).should("have.value", candidate.email);
      cy.get(ADDRESS_COMPLEMENT_INPUT).should(
        "have.value",
        candidate.addressComplement,
      );
    });

    it("should load countries and departments in select fields", () => {
      cy.get(COUNTRY_SELECT).find("option").should("have.length.gt", 1);
      cy.get(BIRTH_DEPARTMENT_SELECT)
        .find("option")
        .should("have.length.gt", 1);
    });
  });

  describe("Form Field Validation", () => {
    it("should display validation errors for required fields when submitting empty form", () => {
      cy.get(FIRSTNAME_INPUT).clear();
      cy.get(LASTNAME_INPUT).clear();
      cy.get(BIRTH_CITY_INPUT).clear();
      cy.get(BIRTHDATE_INPUT).clear();
      cy.get(STREET_INPUT).clear();
      cy.get(CITY_INPUT).clear();
      cy.get(ZIP_INPUT).clear();
      cy.get(PHONE_INPUT).clear();
      cy.get(EMAIL_INPUT).clear();

      cy.get(SUBMIT_BUTTON).click({ force: true });

      cy.get('[data-testid="firstname-input"]').should(
        "have.class",
        ERROR_CLASS,
      );
      cy.get('[data-testid="lastname-input"]').should(
        "have.class",
        ERROR_CLASS,
      );
      cy.get('[data-testid="phone-input"]').should("have.class", ERROR_CLASS);
      cy.get('[data-testid="email-input"]').should("have.class", ERROR_CLASS);
    });

    it("should validate email format", () => {
      cy.get(EMAIL_INPUT).clear().type("invalid-email");
      cy.get(SUBMIT_BUTTON).click();
      cy.get('[data-testid="email-input"]').should("have.class", ERROR_CLASS);
    });

    it("should validate phone number format", () => {
      cy.get(PHONE_INPUT).clear().type("123");
      cy.get(SUBMIT_BUTTON).click();
      cy.get('[data-testid="phone-input"]').should("have.class", ERROR_CLASS);
    });

    it("should validate zip code format", () => {
      cy.get(ZIP_INPUT).clear().type("123");
      cy.get(SUBMIT_BUTTON).click();
      cy.get('[data-testid="zip-input"]').should("have.class", ERROR_CLASS);
    });

    it("should validate birthdate is not in the future", () => {
      cy.get(BIRTHDATE_INPUT).clear().type("2050-01-01");
      cy.get(SUBMIT_BUTTON).click();
      cy.get('[data-testid="birthdate-input"]').should(
        "have.class",
        ERROR_CLASS,
      );
    });
  });

  describe("Form Submission Handling", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        if (req.body.operationName === "updateCandidateInformationMutation") {
          req.reply({
            data: {
              candidate_updateCandidateInformationBySelf: {
                id: "12345678-1234-1234-1234-123456789abc",
              },
            },
          });
        }
      }).as("updateCandidateInformation");
    });

    it("should successfully submit form with valid data", () => {
      cy.get(FIRSTNAME_INPUT).clear().type("Jane");
      cy.get(LASTNAME_INPUT).clear().type("Smith");
      cy.get(PHONE_INPUT).clear().type("0607080910");

      cy.get(SUBMIT_BUTTON).click();

      cy.wait("@updateCandidateInformation");
      cy.get(TOAST_SUCCESS).should("be.visible");
    });

    it("should display error message when API request fails", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        if (req.body.operationName === "updateCandidateInformationMutation") {
          req.reply({
            errors: [
              { message: "Une erreur est survenue lors de la mise à jour" },
            ],
          });
        }
      }).as("updateCandidateInformationError");

      cy.get(FIRSTNAME_INPUT).clear().type("Jane");
      cy.get(SUBMIT_BUTTON).click();

      cy.wait("@updateCandidateInformationError");
      cy.get(TOAST_ERROR).should("be.visible");
    });
  });

  describe("Form Reset Functionality", () => {
    it("should reset form to initial values when clicking reset button", () => {
      cy.get(FIRSTNAME_INPUT).clear().type("Jane");
      cy.get(LASTNAME_INPUT).clear().type("Smith");
      cy.get(PHONE_INPUT).clear().type("0607080910");

      cy.get(RESET_BUTTON).click();

      cy.get(FIRSTNAME_INPUT).should("have.value", "John");
      cy.get(LASTNAME_INPUT).should("have.value", "Doe");
      cy.get(PHONE_INPUT).should("have.value", "0601020304");
    });
  });

  describe("Optional Fields Handling", () => {
    it("should allow submission with empty optional fields", () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        if (req.body.operationName === "updateCandidateInformationMutation") {
          req.reply({
            data: {
              candidate_updateCandidateInformationBySelf: {
                id: "12345678-1234-1234-1234-123456789abc",
              },
            },
          });
        }
      }).as("updateCandidateInformation");

      cy.get(GIVEN_NAME_INPUT).clear();
      cy.get(FIRSTNAME2_INPUT).clear();
      cy.get(FIRSTNAME3_INPUT).clear();
      cy.get(ADDRESS_COMPLEMENT_INPUT).clear();

      cy.get(SUBMIT_BUTTON).click();

      cy.wait("@updateCandidateInformation");
      cy.get(TOAST_SUCCESS).should("be.visible");
    });
  });

  describe("Select Fields Interaction", () => {
    beforeEach(() => {
      cy.intercept("POST", "/api/graphql", (req) => {
        if (req.body.operationName === "updateCandidateInformationMutation") {
          req.reply({
            data: {
              candidate_updateCandidateInformationBySelf: {
                id: "12345678-1234-1234-1234-123456789abc",
              },
            },
          });
        }
      }).as("updateCandidateInformation");
    });

    it("should allow changing gender selection", () => {
      cy.get(GENDER_SELECT).select("woman");
      cy.get(SUBMIT_BUTTON).click();

      cy.wait("@updateCandidateInformation");
      cy.get(TOAST_SUCCESS).should("be.visible");
    });

    it("should allow changing country selection", () => {
      cy.get(COUNTRY_SELECT).select(1);
      cy.get(SUBMIT_BUTTON).click();

      cy.wait("@updateCandidateInformation");
      cy.get(TOAST_SUCCESS).should("be.visible");
    });

    it("should allow changing birth department when country is France", () => {
      cy.get(COUNTRY_SELECT).select(FRANCE_COUNTRY_ID);
      cy.get(BIRTH_DEPARTMENT_SELECT).should("not.be.disabled");
      cy.get(BIRTH_DEPARTMENT_SELECT).select(1);
      cy.get(SUBMIT_BUTTON).click();

      cy.wait("@updateCandidateInformation");
      cy.get(TOAST_SUCCESS).should("be.visible");
    });

    it("should disable birth department when country is not France", () => {
      cy.get(COUNTRY_SELECT).select(2);
      cy.get(BIRTH_DEPARTMENT_SELECT).should("be.disabled");
      cy.get(SUBMIT_BUTTON).should("not.be.disabled");
    });
  });
});
