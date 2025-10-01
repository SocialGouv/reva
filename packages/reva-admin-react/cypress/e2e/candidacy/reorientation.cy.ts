import { stubMutation, stubQuery } from "../../utils/graphql";

const candidacyId = "46206f6b-0a59-4478-9338-45e3a8d968e4";

function visitReorientation({
  userProfile,
  candidacyFixture,
}: {
  userProfile: "admin" | "aap";
  candidacyFixture: string;
}) {
  cy.intercept("POST", "/api/graphql", (req) => {
    stubQuery(req, "activeFeaturesForConnectedUser", {
      data: {
        activeFeaturesForConnectedUser: [],
      },
    });
    if (userProfile === "aap") {
      stubQuery(req, "getOrganismForAAPVisibilityCheck", "visibility/aap.json");
      stubQuery(req, "getAccountInfo", "account/aap-info.json");
    } else {
      stubQuery(
        req,
        "getOrganismForAAPVisibilityCheck",
        "visibility/admin.json",
      );
      stubQuery(req, "getAccountInfo", "account/admin-info.json");
    }

    stubQuery(req, "getCandidacyForReorientation", candidacyFixture);
    stubQuery(
      req,
      "getCertificationsForCandidate",
      "candidacy/reorientation/certifications-list.json",
    );
    stubMutation(
      req,
      "updateCertificationWithinOrganismScope",
      "candidacy/reorientation/update-certification-success.json",
    );
    stubMutation(
      req,
      "updateCertification",
      "candidacy/reorientation/update-certification-success.json",
    );
  });

  if (userProfile === "admin") {
    cy.admin(`/candidacies/${candidacyId}/reorientation`);
  } else {
    cy.collaborateur(`/candidacies/${candidacyId}/reorientation`);
  }
}

describe("Certification reorientation page", () => {
  context("Candidacy with AAP", () => {
    it("should display the reorientation page with certifications list", () => {
      visitReorientation({
        userProfile: "aap",
        candidacyFixture: "candidacy/reorientation/candidacy-with-aap.json",
      });

      cy.wait("@getCandidacyForReorientation");
      cy.wait("@getCertificationsForCandidate");

      [
        "Titre à finalité professionnelle Assistant de vie dépendance (ADVD)",
        "Titre professionnel Agent de restauration",
        "Diplôme d'État d'aide-soignant",
      ].forEach((titre) => {
        cy.contains(titre).should("exist");
      });
    });

    it("should allow selecting a new certification", () => {
      visitReorientation({
        userProfile: "aap",
        candidacyFixture: "candidacy/reorientation/candidacy-with-aap.json",
      });

      cy.wait("@getCandidacyForReorientation");
      cy.wait("@getCertificationsForCandidate");

      cy.contains(
        '[data-test="results"] > div',
        "Titre professionnel Agent de restauration",
      )
        .find("button")
        .click();

      cy.get("#confirm-reorientation").should("be.visible");
      cy.contains("Titre professionnel Agent de restauration").should("exist");
    });
  });

  context("Candidacy with AUTONOME type", () => {
    it("should display certifications for autonomous candidacy", () => {
      visitReorientation({
        userProfile: "admin",
        candidacyFixture: "candidacy/reorientation/candidacy-autonome.json",
      });

      cy.wait("@getCandidacyForReorientation");
      cy.wait("@getCertificationsForCandidate");

      cy.contains("h1", "Changement de certification").should("exist");
      cy.contains("Titre professionnel Agent de restauration").should("exist");
      cy.contains("RNCP35650").should("exist");
    });
  });
});
