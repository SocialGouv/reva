import candidacyInfoForLayout from "../../../(certificateur)/fixtures/candidacy-info-for-layout.json";
import dossierDeValidationCountByCategory from "../../../(certificateur)/fixtures/dossier-de-validation-count-by-category.json";
import feasibilityCountByCategory from "../../../(certificateur)/fixtures/feasibility-count-by-category.json";
import juryCountByCategory from "../../../(certificateur)/fixtures/jury-count-by-category.json";
import maisonMereCGU from "../../../(certificateur)/fixtures/maison-mere-cgu.json";
import organismForAAPVisibilityCheck from "../../../(certificateur)/fixtures/organism-for-aap-visibility-check.json";
import { stubQuery } from "../../../../utils/graphql";

import aapFeasibilitySummary from "./fixtures/aap-dematerialized-summary.json";
import certificateurFeasibilitySummary from "./fixtures/certificateur-dematerialized-summary.json";

const summary =
  certificateurFeasibilitySummary.data
    .feasibility_getActiveFeasibilityByCandidacyId;
const candidacy = summary.candidacy;

type Scenario = {
  label: string;
  setupInterceptions: () => void;
  visit: () => void;
  waitAliases: string[];
};

const scenarios: Scenario[] = [
  {
    label: "certificateur summary page",
    setupInterceptions: () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(req, "activeFeaturesForConnectedUser", {
          data: { activeFeaturesForConnectedUser: [] },
        });
        stubQuery(
          req,
          "getOrganismForAAPVisibilityCheck",
          organismForAAPVisibilityCheck,
        );
        stubQuery(req, "getMaisonMereCGUQuery", maisonMereCGU);
        stubQuery(
          req,
          "getCandidacyWithCandidateInfoForLayout",
          candidacyInfoForLayout,
        );
        stubQuery(
          req,
          "getFeasibilityCountByCategory",
          feasibilityCountByCategory,
        );
        stubQuery(
          req,
          "getDossierDeValidationCountByCategory",
          dossierDeValidationCountByCategory,
        );
        stubQuery(req, "getJuryCountByCategory", juryCountByCategory);
        stubQuery(req, "getCandidacyWithFeasibilityQuery", {
          data: {
            getCandidacyById: {
              id: candidacy.id,
              feasibilityFormat: "DEMATERIALIZED",
            },
          },
        });
        stubQuery(req, "candidacy_canAccessCandidacy", {
          data: { candidacy_canAccessCandidacy: true },
        });
        stubQuery(
          req,
          "feasibilityGetActiveFeasibilityByCandidacyId",
          certificateurFeasibilitySummary,
        );
      });
    },
    visit: () => cy.certificateur(`/candidacies/${candidacy.id}/feasibility/`),
    waitAliases: [
      "@activeFeaturesForConnectedUser",
      "@getOrganismForAAPVisibilityCheck",
      "@getMaisonMereCGUQuery",
      "@getCandidacyWithCandidateInfoForLayout",
      "@getFeasibilityCountByCategory",
      "@getDossierDeValidationCountByCategory",
      "@getJuryCountByCategory",
      "@getCandidacyWithFeasibilityQuery",
      "@candidacy_canAccessCandidacy",
      "@feasibilityGetActiveFeasibilityByCandidacyId",
    ],
  },
  {
    label: "AAP send-file summary page",
    setupInterceptions: () => {
      cy.intercept("POST", "/api/graphql", (req) => {
        stubQuery(
          req,
          "activeFeaturesForConnectedUser",
          "features/active-features.json",
        );
        stubQuery(
          req,
          "getMaisonMereCGUQuery",
          "account/gestionnaire-cgu-accepted.json",
        );
        stubQuery(
          req,
          "getOrganismForAAPVisibilityCheck",
          "visibility/organism.json",
        );
        stubQuery(req, "getAccountInfo", "account/gestionnaire-info.json");
        stubQuery(
          req,
          "getCandidacyMenuAndCandidateInfos",
          "candidacy/candidacy-menu-dff.json",
        );
        stubQuery(
          req,
          "getCandidacyByIdForAAPFeasibilityPage",
          aapFeasibilitySummary,
        );
        stubQuery(req, "candidacy_canAccessCandidacy", {
          data: { candidacy_canAccessCandidacy: true },
        });
        stubQuery(
          req,
          "getActiveFeasibilitySendFileCertificationAuthorityByCandidacyId",
          certificateurFeasibilitySummary,
        );
      });
    },
    visit: () =>
      cy.collaborateur(
        `/candidacies/${candidacy.id}/feasibility-aap/send-file-certification-authority`,
      ),
    waitAliases: [
      "@activeFeaturesForConnectedUser",
      "@getMaisonMereCGUQuery",
      "@getOrganismForAAPVisibilityCheck",
      "@getAccountInfo",
      "@getCandidacyMenuAndCandidateInfos",
      "@candidacy_canAccessCandidacy",
      "@getActiveFeasibilitySendFileCertificationAuthorityByCandidacyId",
    ],
  },
];

describe("Dematerialized feasibility summary", () => {
  scenarios.forEach(({ label, setupInterceptions, visit, waitAliases }) => {
    describe(label, () => {
      beforeEach(() => {
        setupInterceptions();
        visit();
        cy.wait(waitAliases);
        cy.get("[data-test='dff-summary']").should("be.visible");
      });

      it("displays the eligibility badge with the validity information", () => {
        cy.get("[data-test='dff-summary']").within(() => {
          cy.contains("Accès au dossier de faisabilité intégral").should(
            "be.visible",
          );
          cy.contains("31/12/2024").should("be.visible");
        });
      });

      it("shows candidate identification and contact details", () => {
        cy.get("[data-test='dff-summary']").within(() => {
          cy.contains("Mme").should("be.visible");
          cy.contains("Bertrand Camille").should("be.visible");
          cy.contains(", Sabine").should("be.visible");
          cy.contains("Née Durand,").should("be.visible");
          cy.contains("le : 12/03/1987").should("be.visible");

          cy.contains("à Lyon, Rhône (69)").should("be.visible");

          cy.contains(
            "Adresse postale : 10 quai du Port 13002 Marseille",
          ).should("be.visible");
          cy.contains("E-mail : camille.durand@example.com").should(
            "be.visible",
          );
          cy.contains("Téléphone : 0607080910").should("be.visible");
          cy.contains("Nationalité Française").should("be.visible");
          cy.contains("Master logistique et transport").should("be.visible");
        });
      });

      it("renders certification information and languages", () => {
        cy.get("[data-test='dff-summary']").within(() => {
          cy.contains("Titre professionnel Responsable logistique").should(
            "be.visible",
          );
          cy.contains("RNCP 2983029843").should("be.visible");
          cy.contains("Option pilotage d'activité").should("be.visible");

          cy.contains("Langue vivante 1 :")
            .parent()
            .find("p")
            .eq(1)
            .should("contain.text", "Anglais");
          cy.contains("Langue vivante 2 :")
            .parent()
            .find("p")
            .eq(1)
            .should("contain.text", "Espagnol");
        });
      });

      it("shows experience details", () => {
        cy.get("[data-test='dff-summary']").within(() => {
          cy.get("[data-test='experience-accordion-0']").within(() => {
            cy.contains("Expérience 1 - Chef d'équipe logistique").should(
              "be.visible",
            );
            cy.contains("Expérience plus de 3 ans").should("be.visible");
          });

          cy.get("[data-test='experience-accordion-1']").within(() => {
            cy.contains(
              "Expérience 2 - Responsable adjoint d'exploitation",
            ).should("be.visible");
            cy.contains("Expérience entre 1 et 3 ans").should("be.visible");
          });
        });
      });

      it("displays competence blocks with their states", () => {
        cy.get("[data-test='dff-summary']").within(() => {
          cy.contains(
            "button",
            "48379857 - Organiser et piloter les activités logistiques",
          )
            .parents("section.fr-accordion")
            .within(() => {
              cy.contains(".fr-badge", "Oui")
                .parent()
                .should("contain", "Définir les indicateurs de performance");
              cy.contains(".fr-badge", "Partiellement")
                .parent()
                .should("contain", "Manager les équipes logistiques");
              cy.contains(
                "Expérience significative en gestion d'équipe sur site logistique.",
              ).should("be.visible");
            });

          cy.contains(
            "button",
            "2849037 - Digitaliser les processus logistiques",
          )
            .parents("section.fr-accordion")
            .within(() => {
              cy.contains(".fr-badge", "Non")
                .parent()
                .should(
                  "contain",
                  "Mettre en place des outils de suivi en temps réel",
                );
              cy.contains(".fr-badge", "À compléter")
                .parent()
                .should("contain", "Superviser l'intégration des données");
              cy.contains(
                "Compétences à confirmer sur la digitalisation des flux.",
              ).should("be.visible");
            });
        });
      });

      it("groups prerequisites by status", () => {
        cy.get("[data-test='dff-summary']").within(() => {
          cy.contains("button", "Acquis")
            .parents("section.fr-accordion")
            .find("li")
            .should("contain", "Justifier de 2 ans d'expérience en logistique");

          cy.contains("button", "En cours")
            .parents("section.fr-accordion")
            .find("li")
            .should("contain", "Avoir suivi une formation sécurité");

          cy.contains("button", "Préconisés")
            .parents("section.fr-accordion")
            .find("li")
            .should("contain", "Détenir un permis cariste à jour");
        });
      });

      it("shows planned parcours, goals and decision data", () => {
        cy.get("[data-test='dff-summary']").within(() => {
          cy.contains("Accompagnement individuel : 42h").should("be.visible");
          cy.contains("Accompagnement collectif : 18h").should("be.visible");
          cy.contains("Formation : 9h").should("be.visible");

          cy.contains("Prévention des risques professionnels").should(
            "be.visible",
          );
          cy.contains("Management d'équipe avancé").should("be.visible");
          cy.contains("Analyse de données").should("be.visible");
          cy.contains(
            "Évoluer vers un poste de responsable d'exploitation",
          ).should("be.visible");
          cy.contains("Structurer une équipe logistique multi-sites").should(
            "be.visible",
          );

          cy.contains("Favorable").should("be.visible");
          cy.contains("Candidat très motivé et dossier solide.").should(
            "be.visible",
          );
          cy.contains("Je confirme mon engagement dans ce parcours.").should(
            "be.visible",
          );
        });
      });

      it("lists attachments", () => {
        cy.get("[data-test='dff-summary']").within(() => {
          cy.contains("cv-candidat.pdf").should("be.visible");
          cy.contains("plan-action.pdf").should("be.visible");
          cy.contains("attestation-honneur.pdf").should("be.visible");
        });
      });

      if (label === "certificateur summary page") {
        it("shows the contact blocks", () => {
          cy.get("[data-test='contact-infos-section']").within(() => {
            cy.get("[data-test='organism-contact-info-tile']")
              .should("be.visible")
              .and("contain.text", "Organisme AAP Méditerranée")
              .and("contain.text", "10 quai du Port")
              .and("contain.text", "13002")
              .and("contain.text", "Marseille")
              .and("contain.text", "0499010203")
              .and("contain.text", "suivi@organism-aap.fr");

            cy.get("[data-test='certification-authority-contact-info-tile']")
              .should("be.visible")
              .and("contain.text", "Certificateur Métiers Services");

            cy.get("[data-test='certification-authority-local-account-0']")
              .should("be.visible")
              .and("contain.text", "Claire Lemaire")
              .and("contain.text", "claire.lemaire@certificateur.fr")
              .and("contain.text", "0600000001");

            cy.get("[data-test='certification-authority-local-account-1']")
              .should("be.visible")
              .and("contain.text", "David Roussel")
              .and("contain.text", "david.roussel@certificateur.fr")
              .and("contain.text", "0600000002");
          });
        });
      } else {
        it("hides the contact blocks", () => {
          cy.get("[data-test='contact-infos-section']").should("not.exist");
        });
      }
    });
  });
});
