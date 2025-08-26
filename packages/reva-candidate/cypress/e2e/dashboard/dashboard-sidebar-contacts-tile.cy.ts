import { stubQuery } from "../../utils/graphql";

interface CandidateFixture {
  data: {
    candidate_getCandidateWithCandidacy: {
      candidacy: {
        organism: {
          id: string;
          label: string;
          nomPublic?: string;
          emailContact?: string;
          contactAdministrativeEmail?: string;
          telephone?: string;
          contactAdministrativePhone?: string;
          adresseNumeroEtNomDeRue?: string;
          adresseInformationsComplementaires?: string;
          adresseCodePostal?: string;
          adresseVille?: string;
        } | null;
        feasibility?: {
          certificationAuthority?: {
            label: string;
            contactFullName?: string;
            contactEmail?: string;
          } | null;
        } | null;
        [key: string]: unknown;
      };
    };
  };
}

context("Dashboard Sidebar - Contact Tiles", () => {
  beforeEach(() => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForLayout",
        "candidate1.json",
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForHome",
        "candidate1.json",
      );
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        "candidate1.json",
      );
      stubQuery(req, "activeFeaturesForConnectedUser", {
        data: {
          activeFeaturesForConnectedUser: [],
        },
      });
    });

    cy.login();

    cy.wait([
      "@candidate_getCandidateWithCandidacyForLayout",
      "@candidate_getCandidateWithCandidacyForHome",
      "@candidate_getCandidateWithCandidacyForDashboard",
      "@activeFeaturesForConnectedUser",
    ]);

    cy.visit("/");
  });

  const interceptGraphQL = (candidate: CandidateFixture) => {
    cy.intercept("POST", "/api/graphql", (req) => {
      stubQuery(
        req,
        "candidate_getCandidateWithCandidacyForDashboard",
        candidate,
      );
      stubQuery(req, "candidate_getCandidateWithCandidacyForHome", candidate);
      stubQuery(req, "candidate_getCandidateWithCandidacyForLayout", candidate);
    });
  };

  const resetContactData = (candidate: CandidateFixture) => {
    candidate.data.candidate_getCandidateWithCandidacy.candidacy.organism =
      null;
    candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility = {
      certificationAuthority: null,
    };
    return candidate;
  };

  describe("NoContactTile", () => {
    it("should display when no contacts exist", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetContactData(initialCandidate);

          interceptGraphQL(candidate);

          cy.get('[data-test="no-contact-tile"]').should("be.visible");
          cy.get('[data-test="aap-contact-tile"]').should("not.exist");
          cy.get('[data-test="certification-authority-contact-tile"]').should(
            "not.exist",
          );
        },
      );
    });
  });

  describe("AapContactTile", () => {
    it("should display when organism data is available", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetContactData(initialCandidate);
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.organism =
            {
              id: "org-1",
              label: "Test Organism",
              emailContact: "contact@organism.test",
              telephone: "0123456789",
            };

          interceptGraphQL(candidate);

          cy.get('[data-test="aap-contact-tile"]').should("be.visible");
          cy.get('[data-test="no-contact-tile"]').should("not.exist");
        },
      );
    });

    it("should display with complete address information when available", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetContactData(initialCandidate);
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.organism =
            {
              id: "org-1",
              label: "Test Organism",
              emailContact: "contact@organism.test",
              telephone: "0123456789",
              adresseNumeroEtNomDeRue: "123 Rue de Test",
              adresseInformationsComplementaires: "Bâtiment A",
              adresseCodePostal: "75001",
              adresseVille: "Paris",
            };

          interceptGraphQL(candidate);

          cy.get('[data-test="aap-contact-tile"]').should("be.visible");
          cy.get('[data-test="aap-contact-tile"]')
            .contains("123 Rue de Test")
            .should("be.visible");
          cy.get('[data-test="aap-contact-tile"]')
            .contains("Bâtiment A")
            .should("be.visible");
          cy.get('[data-test="aap-contact-tile"]')
            .contains("75001 Paris")
            .should("be.visible");
        },
      );
    });

    it("should use nomPublic instead of label when available", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetContactData(initialCandidate);
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.organism =
            {
              id: "org-1",
              label: "Test Organism",
              nomPublic: "Public Organism Name",
              emailContact: "contact@organism.test",
              telephone: "0123456789",
            };

          interceptGraphQL(candidate);

          cy.get('[data-test="aap-contact-tile"]').should("be.visible");
          cy.get('[data-test="aap-contact-tile"]')
            .contains("Public Organism Name")
            .should("be.visible");
        },
      );
    });

    it("should use administrative contact details as fallback", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetContactData(initialCandidate);
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.organism =
            {
              id: "org-1",
              label: "Test Organism",
              contactAdministrativeEmail: "admin@organism.test",
              contactAdministrativePhone: "9876543210",
            };

          interceptGraphQL(candidate);

          cy.get('[data-test="aap-contact-tile"]').should("be.visible");
          cy.get('[data-test="aap-contact-tile"]')
            .contains("admin@organism.test")
            .should("be.visible");
          cy.get('[data-test="aap-contact-tile"]')
            .contains("9876543210")
            .should("be.visible");
        },
      );
    });
  });

  describe("CertificationAuthorityContactTile", () => {
    it("should display when certification authority data is available", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetContactData(initialCandidate);
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
            {
              certificationAuthority: {
                label: "Test Certification Authority",
                contactFullName: "John Doe",
                contactEmail: "john.doe@authority.test",
              },
            };

          interceptGraphQL(candidate);

          cy.get('[data-test="certification-authority-contact-tile"]').should(
            "be.visible",
          );
          cy.get('[data-test="no-contact-tile"]').should("not.exist");
        },
      );
    });

    it("should display contact information when available", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetContactData(initialCandidate);
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
            {
              certificationAuthority: {
                label: "Test Certification Authority",
                contactFullName: "John Doe",
                contactEmail: "john.doe@authority.test",
              },
            };

          interceptGraphQL(candidate);

          cy.get('[data-test="certification-authority-contact-tile"]')
            .contains("Test Certification Authority")
            .should("be.visible");
          cy.get('[data-test="certification-authority-contact-tile"]')
            .contains("John Doe")
            .should("be.visible");
          cy.get('[data-test="certification-authority-contact-tile"]')
            .contains("john.doe@authority.test")
            .should("be.visible");
        },
      );
    });

    it("should display local accounts contact information when available", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetContactData(initialCandidate);
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
            {
              certificationAuthority: {
                label: "Test Certification Authority",
                contactFullName: "John Doe",
                contactEmail: "john.doe@authority.test",
              },
            };
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.certificationAuthorityLocalAccounts =
            [
              {
                contactFullName: "Jane Doe public contact",
                contactEmail: "janedoepublic@uncertificateur.fr",
                contactPhone: "0123456789",
              },
              {
                contactFullName: "John Doe public contact",
                contactEmail: "johndoepublic@uncertificateur.fr",
                contactPhone: "023456789",
              },
            ];
          interceptGraphQL(candidate);

          cy.get('[data-test="certification-authority-contact-tile"]')
            .contains("Test Certification Authority")
            .should("be.visible");
          cy.get('[data-test="certification-authority-contact-tile"]')
            .contains("Jane Doe public contact")
            .should("be.visible");
          cy.get('[data-test="certification-authority-contact-tile"]')
            .contains("janedoepublic@uncertificateur.fr")
            .should("be.visible");
          cy.get('[data-test="certification-authority-contact-tile"]')
            .contains("0123456789")
            .should("be.visible");
        },
      );
    });

    it("should handle missing contact information", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetContactData(initialCandidate);
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
            {
              certificationAuthority: {
                label: "Test Certification Authority",
              },
            };

          interceptGraphQL(candidate);

          cy.get('[data-test="certification-authority-contact-tile"]').should(
            "be.visible",
          );
          cy.get('[data-test="certification-authority-contact-tile"]')
            .contains("Test Certification Authority")
            .should("be.visible");
        },
      );
    });
  });

  describe("Multiple Contact Tiles", () => {
    it("should display both AAP and certification authority tiles when both exist", () => {
      cy.fixture("candidate1.json").then(
        (initialCandidate: CandidateFixture) => {
          const candidate = resetContactData(initialCandidate);
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.organism =
            {
              id: "org-1",
              label: "Test Organism",
              emailContact: "contact@organism.test",
              telephone: "0123456789",
            };
          candidate.data.candidate_getCandidateWithCandidacy.candidacy.feasibility =
            {
              certificationAuthority: {
                label: "Test Certification Authority",
                contactFullName: "John Doe",
                contactEmail: "john.doe@authority.test",
              },
            };

          interceptGraphQL(candidate);

          cy.get('[data-test="aap-contact-tile"]').should("be.visible");
          cy.get('[data-test="certification-authority-contact-tile"]').should(
            "be.visible",
          );
          cy.get('[data-test="no-contact-tile"]').should("not.exist");
        },
      );
    });
  });
});
