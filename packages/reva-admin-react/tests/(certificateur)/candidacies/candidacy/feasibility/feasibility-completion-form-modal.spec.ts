import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getCertificateurCommonHandlers } from "../../../../shared/helpers/common-handlers/certificateur/getCertificateurCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

// import type { Page } from "@playwright/test";

const CANDIDACY_ID = "42288593-2a6b-4606-aedd-0d76348b39f4";
const fvae = graphql.link("https://reva-api/api/graphql");

const dematerializedFeasibilityFile = {
  id: "3f9b5518-16f8-4b8d-b585-0b046c938ee9",
  swornStatementFile: null,
  sentToCandidateAt: 1716984000000,
  aapDecision: "FAVORABLE",
  aapDecisionComment: null,
  candidateDecisionComment: null,
  prerequisites: [],
  firstForeignLanguage: null,
  secondForeignLanguage: null,
  option: null,
  blocsDeCompetences: [],
  certificationCompetenceDetails: [],
  attachments: [],
  eligibilityRequirement: "FULL_ELIGIBILITY_REQUIREMENT",
  eligibilityValidUntil: 1735646400000,
  eligibilityCandidateSituation: "PREMIERE_DEMANDE_RECEVABILITE",
  dffFile: null,
};

const candidacy = {
  id: CANDIDACY_ID,
  status: "DOSSIER_FAISABILITE_COMPLET",
  isCertificationPartial: false,
  organism: {
    contactAdministrativePhone: "0145678901",
    contactAdministrativeEmail: "contact@organism-aap.fr",
    adresseVille: "Marseille",
    adresseCodePostal: "13002",
    adresseInformationsComplementaires: null,
    adresseNumeroEtNomDeRue: "10 quai du Port",
    emailContact: "suivi@organism-aap.fr",
    telephone: "0499010203",
    nomPublic: "Organisme AAP",
    label: "Organisme AAP",
  },
  certificationAuthorityLocalAccounts: [],
  individualHourCount: null,
  collectiveHourCount: null,
  additionalHourCount: null,
  basicSkills: [],
  mandatoryTrainings: [],
  certification: {
    id: "cert-1",
    certificationAuthorities: [],
    label: "Titre professionnel Responsable logistique",
    codeRncp: "2983029843",
    level: 6,
    degree: { level: 6 },
    certificationAuthorityStructure: { label: "Ministère du Travail" },
  },
  goals: [],
  experiences: [],
  certificateSkills: null,
  candidateInfo: null,
  candidate: {
    highestDegree: { level: "6" },
    niveauDeFormationLePlusEleve: { level: "6" },
    highestDegreeLabel: null,
    firstname: "Camille",
    firstname2: null,
    firstname3: null,
    lastname: "Durand",
    email: "camille.durand@example.com",
    givenName: null,
    birthdate: "1987-03-12",
    birthCity: "Lyon",
    birthDepartment: {
      label: "Rhône",
      code: "69",
      region: { code: "84", label: "Auvergne-Rhône-Alpes" },
    },
    country: { id: "FR", label: "France" },
    nationality: "Française",
    gender: "woman",
    phone: "0607080910",
    city: "Marseille",
    street: "10 quai du Port",
    zip: "13002",
  },
  candidacyDropOut: null,
};

const feasibilityPendingDecision = {
  id: "91b6a93d-0f2b-4e0f-85f1-31f3a4e61251",
  decision: "PENDING",
  decisionComment: null,
  decisionSentAt: null,
  certificationAuthority: {
    id: "ca-1",
    label: "Certificateur Métiers Services",
    contactFullName: "Hélène Martin",
    contactEmail: "helene.martin@certificateur.fr",
    contactPhone: "0176543210",
  },
  history: [],
  dematerializedFeasibilityFile,
  candidacy,
};

test.describe("Feasibility completion form – confirmation modal", () => {
  const { certificateurCommonHandlers, certificateurCommonWait } =
    getCertificateurCommonHandlers({
      candidacyId: CANDIDACY_ID,
      candidateFirstname: "Camille",
      candidateLastname: "Durand",
    });

  const feasibilityQueryHandler = fvae.query(
    "feasibilityGetActiveFeasibilityByCandidacyId",
    graphQLResolver({
      feasibility_getActiveFeasibilityByCandidacyId: feasibilityPendingDecision,
    }),
  );

  const createOrUpdateDecisionMutationHandler = fvae.mutation(
    "createOrUpdateCertificationAuthorityDecision",
    graphQLResolver({
      dematerialized_feasibility_file_createOrUpdateCertificationAuthorityDecision:
        {
          id: feasibilityPendingDecision.id,
        },
    }),
  );

  test.use({
    mswHandlers: [
      [
        ...certificateurCommonHandlers,
        fvae.query(
          "getCandidacyWithFeasibilityQuery",
          graphQLResolver({
            getCandidacyById: {
              id: CANDIDACY_ID,
              feasibilityFormat: "DEMATERIALIZED",
            },
          }),
        ),
        feasibilityQueryHandler,
        createOrUpdateDecisionMutationHandler,
      ],
      { scope: "test" },
    ],
  });

  test.beforeEach(async ({ page }) => {
    await login({ role: "certificateur", page });
    await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/feasibility/`);
    await Promise.all([
      certificateurCommonWait(page),
      waitGraphQL(page, "getCandidacyWithFeasibilityQuery"),
      waitGraphQL(page, "feasibilityGetActiveFeasibilityByCandidacyId"),
    ]);
  });

  test("shows confirmation modal when user selects COMPLETE and submits", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "État du dossier de faisabilité",
      }),
    ).toBeVisible();

    await page
      .getByRole("radio", { name: /Ce dossier est complet/ })
      .check({ force: true });
    await page.getByRole("button", { name: /Enregistrer/ }).click();

    const modal = page.getByRole("dialog", {
      name: "Confirmer que le dossier est complet",
    });
    await expect(modal).toBeVisible();
    await expect(
      page.getByTestId("confirm-complete-feasibility-modal-button"),
    ).toBeVisible();
    await expect(modal.getByText(/Candidat : Durand Camille/)).toBeVisible();
    await expect(
      modal.getByText(/Certification : RNCP2983029843 - Titre professionnel/),
    ).toBeVisible();
  });

  test("does not show confirmation modal when user selects INCOMPLETE and submits", async ({
    page,
  }) => {
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "État du dossier de faisabilité",
      }),
    ).toBeVisible();

    await page
      .getByRole("radio", { name: /Ce dossier est incomplet/ })
      .check({ force: true });
    await page
      .getByLabel(/Pouvez-vous indiquer les éléments à revoir/)
      .fill("Pièces manquantes.");
    await page.getByRole("button", { name: /Enregistrer/ }).click();

    const modal = page.getByRole("dialog", {
      name: "Confirmer que le dossier est complet",
    });
    await expect(modal).not.toBeVisible();
  });
});
