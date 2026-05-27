import { addDays, format, subDays } from "date-fns";

import candidacy1Data from "../../fixtures/candidacy1.json";
import candidate1Data from "../../fixtures/candidate1.json";
import { stubQuery } from "../../utils/graphql";

context("Dashboard Tiles", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const interceptGraphQL = (candidacy?: any) => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateForCandidatesGuard",
        "candidate1-for-candidates-guard.json",
      );
      stubQuery(req, "getCandidateByIdForCandidateGuard", candidate1Data);
      stubQuery(
        req,
        "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
        "candidacies-with-candidacy-1.json",
      );

      stubQuery(
        req,
        "getCandidacyByIdForCandidacyGuard",
        candidacy || "candidacy1.json",
      );
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: [],
        },
      });
      stubQuery(
        req,
        "getCandidacyByIdWithCandidate",
        candidacy || "candidacy1.json",
      );
      stubQuery(
        req,
        "getCandidacyByIdForDashboard",
        candidacy || "candidacy1.json",
      );
    });

    cy.login();

    cy.visit(
      `/candidates/${candidate1Data.data.candidate_getCandidateById.id}/candidacies/${(candidacy || candidacy1Data).data.getCandidacyById.id}`,
    );

    cy.wait([
      "@getCandidateByIdForCandidateGuard",
      "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);
  };

  describe("Training Tile", () => {
    it("should be disabled when candidacy status is PROJET", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "PROJET";

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-tile"] button').should("be.disabled");
      });
    });

    it("should be disabled when candidacy status is VALIDATION", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "VALIDATION";

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-tile"] button').should("be.disabled");
      });
    });

    it("should be disabled when candidacy status is PRISE_EN_CHARGE and first appointment is in the future", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "PRISE_EN_CHARGE";
        candidacy.data.getCandidacyById.firstAppointmentOccuredAt = format(
          addDays(new Date(), 5),
          "yyyy-MM-dd",
        );

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-tile"] button').should("be.disabled");
      });
    });

    it("should show 'en cours' badge when candidacy status is PRISE_EN_CHARGE and first appointment is passed", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "PRISE_EN_CHARGE";
        candidacy.data.getCandidacyById.firstAppointmentOccuredAt = format(
          subDays(new Date(), 5),
          "yyyy-MM-dd",
        );

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-status-badge-in-progress"]').should(
          "be.visible",
        );
      });
    });

    it("should show 'en cours' badge when candidacy status is VALIDATION and first appointment is passed", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "VALIDATION";
        candidacy.data.getCandidacyById.firstAppointmentOccuredAt = format(
          subDays(new Date(), 5),
          "yyyy-MM-dd",
        );

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-status-badge-in-progress"]').should(
          "be.visible",
        );
      });
    });

    it("should show 'to validate' badge when status is PARCOURS_ENVOYE", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "PARCOURS_ENVOYE";
        candidacy.data.getCandidacyById.firstAppointmentOccuredAt = format(
          subDays(new Date(), 5),
          "yyyy-MM-dd",
        );

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-status-badge-to-validate"]').should(
          "be.visible",
        );
      });
    });

    it("should show 'validated' badge when status is PARCOURS_CONFIRME", () => {
      cy.fixture("candidacy1.json").then((candidacy) => {
        candidacy.data.getCandidacyById.status = "PARCOURS_CONFIRME";

        interceptGraphQL(candidacy);

        cy.get('[data-testid="training-status-badge-validated"]').should(
          "be.visible",
        );
      });
    });
  });
});
