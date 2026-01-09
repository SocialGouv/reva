import candidate1Data from "../../fixtures/candidate1.json";
import { stubQuery } from "../../utils/graphql";

const candidate = candidate1Data.data.candidate_getCandidateById;

interface CandidacyFixture {
  data: {
    getCandidacyById: {
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
}

context("Dashboard Sidebar - Contact Tiles", () => {
  const interceptGraphQL = (candidacy?: CandidacyFixture) => {
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

    cy.wait([
      "@candidate_getCandidateForCandidatesGuard",
      "@getCandidateByIdForCandidateGuard",
      "@candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
      "@activeFeaturesForConnectedUser",
      "@getCandidacyByIdForCandidacyGuard",
      "@getCandidacyByIdWithCandidate",
      "@getCandidacyByIdForDashboard",
    ]);
  };

  const resetContactData = (candidacy: CandidacyFixture) => {
    candidacy.data.getCandidacyById.organism = null;
    candidacy.data.getCandidacyById.feasibility = {
      certificationAuthority: null,
    };
    return candidacy;
  };

  describe("NoContactTile", () => {
    it("should display when no contacts exist", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetContactData(initialCandidacy);

          interceptGraphQL(candidacy);

          cy.get('[data-testid="no-contact-tile"]').should("be.visible");
          cy.get('[data-testid="aap-contact-tile"]').should("not.exist");
          cy.get('[data-testid="certification-authority-contact-tile"]').should(
            "not.exist",
          );
        },
      );
    });
  });

  describe("AapContactTile", () => {
    it("should display when organism data is available", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetContactData(initialCandidacy);
          candidacy.data.getCandidacyById.organism = {
            id: "org-1",
            label: "Test Organism",
            emailContact: "contact@organism.test",
            telephone: "0123456789",
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="aap-contact-tile"]').should("be.visible");
          cy.get('[data-testid="no-contact-tile"]').should("not.exist");
        },
      );
    });

    it("should display with complete address information when available", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetContactData(initialCandidacy);
          candidacy.data.getCandidacyById.organism = {
            id: "org-1",
            label: "Test Organism",
            emailContact: "contact@organism.test",
            telephone: "0123456789",
            adresseNumeroEtNomDeRue: "123 Rue de Test",
            adresseInformationsComplementaires: "Bâtiment A",
            adresseCodePostal: "75001",
            adresseVille: "Paris",
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="aap-contact-tile"]').should("be.visible");
          cy.get('[data-testid="aap-contact-tile"]')
            .contains("123 Rue de Test")
            .should("be.visible");
          cy.get('[data-testid="aap-contact-tile"]')
            .contains("Bâtiment A")
            .should("be.visible");
          cy.get('[data-testid="aap-contact-tile"]')
            .contains("75001 Paris")
            .should("be.visible");
        },
      );
    });

    it("should use nomPublic instead of label when available", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetContactData(initialCandidacy);
          candidacy.data.getCandidacyById.organism = {
            id: "org-1",
            label: "Test Organism",
            nomPublic: "Public Organism Name",
            emailContact: "contact@organism.test",
            telephone: "0123456789",
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="aap-contact-tile"]').should("be.visible");
          cy.get('[data-testid="aap-contact-tile"]')
            .contains("Public Organism Name")
            .should("be.visible");
        },
      );
    });

    it("should use administrative contact details as fallback", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetContactData(initialCandidacy);
          candidacy.data.getCandidacyById.organism = {
            id: "org-1",
            label: "Test Organism",
            contactAdministrativeEmail: "admin@organism.test",
            contactAdministrativePhone: "9876543210",
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="aap-contact-tile"]').should("be.visible");
          cy.get('[data-testid="aap-contact-tile"]')
            .contains("admin@organism.test")
            .should("be.visible");
          cy.get('[data-testid="aap-contact-tile"]')
            .contains("9876543210")
            .should("be.visible");
        },
      );
    });
  });

  describe("CertificationAuthorityContactTile", () => {
    it("should display when certification authority data is available", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetContactData(initialCandidacy);
          candidacy.data.getCandidacyById.feasibility = {
            certificationAuthority: {
              label: "Test Certification Authority",
              contactFullName: "John Doe",
              contactEmail: "john.doe@authority.test",
            },
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="certification-authority-contact-tile"]').should(
            "be.visible",
          );
          cy.get('[data-testid="no-contact-tile"]').should("not.exist");
        },
      );
    });

    it("should display contact information when available", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetContactData(initialCandidacy);
          candidacy.data.getCandidacyById.feasibility = {
            certificationAuthority: {
              label: "Test Certification Authority",
              contactFullName: "John Doe",
              contactEmail: "john.doe@authority.test",
            },
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="certification-authority-contact-tile"]')
            .contains("Test Certification Authority")
            .should("be.visible");
          cy.get('[data-testid="certification-authority-contact-tile"]')
            .contains("John Doe")
            .should("be.visible");
          cy.get('[data-testid="certification-authority-contact-tile"]')
            .contains("john.doe@authority.test")
            .should("be.visible");
        },
      );
    });

    it("should display local accounts contact information when available", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetContactData(initialCandidacy);
          candidacy.data.getCandidacyById.feasibility = {
            certificationAuthority: {
              label: "Test Certification Authority",
              contactFullName: "John Doe",
              contactEmail: "john.doe@authority.test",
            },
          };
          candidacy.data.getCandidacyById.certificationAuthorityLocalAccounts =
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
          interceptGraphQL(candidacy);

          cy.get('[data-testid="certification-authority-contact-tile"]')
            .contains("Test Certification Authority")
            .should("be.visible");
          cy.get('[data-testid="certification-authority-contact-tile"]')
            .contains("Jane Doe public contact")
            .should("be.visible");
          cy.get('[data-testid="certification-authority-contact-tile"]')
            .contains("janedoepublic@uncertificateur.fr")
            .should("be.visible");
          cy.get('[data-testid="certification-authority-contact-tile"]')
            .contains("0123456789")
            .should("be.visible");
        },
      );
    });

    it("should handle missing contact information", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetContactData(initialCandidacy);
          candidacy.data.getCandidacyById.feasibility = {
            certificationAuthority: {
              label: "Test Certification Authority",
            },
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="certification-authority-contact-tile"]').should(
            "be.visible",
          );
          cy.get('[data-testid="certification-authority-contact-tile"]')
            .contains("Test Certification Authority")
            .should("be.visible");
        },
      );
    });
  });

  describe("Multiple Contact Tiles", () => {
    it("should display both AAP and certification authority tiles when both exist", () => {
      cy.fixture("candidacy1.json").then(
        (initialCandidacy: CandidacyFixture) => {
          const candidacy = resetContactData(initialCandidacy);
          candidacy.data.getCandidacyById.organism = {
            id: "org-1",
            label: "Test Organism",
            emailContact: "contact@organism.test",
            telephone: "0123456789",
          };
          candidacy.data.getCandidacyById.feasibility = {
            certificationAuthority: {
              label: "Test Certification Authority",
              contactFullName: "John Doe",
              contactEmail: "john.doe@authority.test",
            },
          };

          interceptGraphQL(candidacy);

          cy.get('[data-testid="aap-contact-tile"]').should("be.visible");
          cy.get('[data-testid="certification-authority-contact-tile"]').should(
            "be.visible",
          );
          cy.get('[data-testid="no-contact-tile"]').should("not.exist");
        },
      );
    });
  });
});
