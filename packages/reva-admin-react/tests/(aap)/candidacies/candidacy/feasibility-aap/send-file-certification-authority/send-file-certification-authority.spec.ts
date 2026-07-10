import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../../shared/helpers/network/requests";

const CANDIDACY_ID = "42288593-2a6b-4606-aedd-0d76348b39f4";
const fvae = graphql.link("https://reva-api/api/graphql");

const PAGE_URL = `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/send-file-certification-authority/`;
const SUMMARY_URL = `/admin2/candidacies/${CANDIDACY_ID}/feasibility-aap/`;

const QUERY_NAME =
  "getActiveFeasibilitySendFileCertificationAuthorityByCandidacyId";
const MUTATION_NAME = "sendToCertificationAuthority";

const dematerializedFeasibilityFile = {
  id: "3f9b5518-16f8-4b8d-b585-0b046c938ee9",
  eligibilityCandidateSituation: "PREMIERE_DEMANDE_RECEVABILITE",
  swornStatementFile: null,
  sentToCandidateAt: 1716984000000,
  aapDecision: "FAVORABLE",
  aapDecisionComment: null,
  candidateDecisionComment: null,
  prerequisitesComment: null,
  prerequisites: [],
  firstForeignLanguage: null,
  secondForeignLanguage: null,
  option: null,
  blocsDeCompetences: [],
  certificationCompetenceDetails: [],
  attachments: [],
  isReadyToBeSentToCertificationAuthority: true,
  eligibilityRequirement: "FULL_ELIGIBILITY_REQUIREMENT",
  eligibilityValidUntil: 1735646400000,
  dffFile: null,
};

const candidacy = {
  id: CANDIDACY_ID,
  isCertificationPartial: false,
  typology: "A1",
  feasibility: {
    certificationAuthority: null,
  },
  conventionCollective: null,
  certificationAuthorities: [
    { id: "ca-1", label: "Certificateur Métiers Services" },
  ],
  certificationAuthorityLocalAccounts: [],
  individualHourCount: 42,
  collectiveHourCount: 18,
  additionalHourCount: 9,
  basicSkills: [],
  mandatoryTrainings: [],
  certification: {
    id: "cert-1",
    label: "Titre professionnel Responsable logistique",
    codeRncp: "2983029843",
    level: 6,
    degree: { level: 6 },
    competenceBlocs: [],
    certificationAuthorityStructure: { label: "Ministère du Travail" },
  },
  goals: [],
  experiences: [],
  certificateSkills: null,
  candidateInfo: {
    street: "10 quai du Port",
    city: "Marseille",
    zip: "13002",
    addressComplement: null,
  },
  candidate: {
    highestDegree: { level: "6" },
    niveauDeFormationLePlusEleve: { level: "6" },
    highestDegreeLabel: null,
    firstname: "Camille",
    firstname2: null,
    firstname3: null,
    middleNames: null,
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
};

const buildFeasibility = (overrides: {
  decision?: string;
  decisionSentAt?: number | null;
  decisionComment?: string | null;
  feasibilityFileSentAt?: number | null;
  certificationAuthorities?: { id: string; label: string }[];
  isReadyToBeSentToCertificationAuthority?: boolean;
}) => ({
  decision: overrides.decision ?? "PENDING",
  decisionSentAt: overrides.decisionSentAt ?? null,
  decisionComment: overrides.decisionComment ?? null,
  feasibilityFileSentAt: overrides.feasibilityFileSentAt ?? null,
  dematerializedFeasibilityFile: {
    ...dematerializedFeasibilityFile,
    isReadyToBeSentToCertificationAuthority:
      overrides.isReadyToBeSentToCertificationAuthority ?? true,
  },
  candidacy: {
    ...candidacy,
    certificationAuthorities:
      overrides.certificationAuthorities ?? candidacy.certificationAuthorities,
  },
});

const createFeasibilityQueryHandler = (
  feasibility: ReturnType<typeof buildFeasibility>,
) =>
  fvae.query(
    QUERY_NAME,
    graphQLResolver({
      feasibility_getActiveFeasibilityByCandidacyId: feasibility,
    }),
  );

const successMutationHandler = fvae.mutation(
  MUTATION_NAME,
  graphQLResolver({
    dematerialized_feasibility_file_sendToCertificationAuthority: true,
  }),
);

test.describe("AAP send file to certification authority page", () => {
  const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

  const goTo = async (page: import("@playwright/test").Page) => {
    await login({ role: "aapCollaborateur", page });
    await page.goto(PAGE_URL);
    await Promise.all([aapCommonWait(page), waitGraphQL(page, QUERY_NAME)]);
  };

  test.describe("single certification authority, ready to be sent", () => {
    const feasibility = buildFeasibility({});

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createFeasibilityQueryHandler(feasibility),
          successMutationHandler,
        ],
        { scope: "test" },
      ],
    });

    test("shows the certification authority as plain text and sends the file on submit", async ({
      page,
    }) => {
      await goTo(page);

      await expect(
        page.getByText("Certificateur Métiers Services"),
      ).toBeVisible();
      await expect(
        page.getByRole("combobox", {
          name: "SÉLECTIONNEZ L'AUTORITÉ DE CERTIFICATION",
        }),
      ).not.toBeVisible();

      const mutationPromise = waitGraphQL(page, MUTATION_NAME);
      await page
        .getByRole("button", { name: "Envoyer au certificateur" })
        .click();
      await mutationPromise;

      await expect(page.getByTestId("toast-success")).toBeVisible();
      await expect(page).toHaveURL(SUMMARY_URL);
    });

    test("navigates back to the feasibility summary when clicking Retour", async ({
      page,
    }) => {
      await goTo(page);
      await page.getByRole("button", { name: "Retour" }).click();
      await expect(page).toHaveURL(SUMMARY_URL);
    });
  });

  test.describe("multiple certification authorities", () => {
    const certificationAuthorities = [
      { id: "ca-1", label: "Certificateur Métiers Services" },
      { id: "ca-2", label: "Certificateur Industries" },
    ];
    const feasibility = buildFeasibility({ certificationAuthorities });

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createFeasibilityQueryHandler(feasibility),
          successMutationHandler,
        ],
        { scope: "test" },
      ],
    });

    test("requires a certification authority to be selected before sending", async ({
      page,
    }) => {
      await goTo(page);

      const select = page.getByRole("combobox", {
        name: "SÉLECTIONNEZ L'AUTORITÉ DE CERTIFICATION",
      });
      await expect(select).toBeVisible();

      await page
        .getByRole("button", { name: "Envoyer au certificateur" })
        .click();

      await expect(page.getByTestId("toast-error")).toBeVisible();
      await expect(
        page.getByText("Veuillez choisir une autorité de certification"),
      ).toBeVisible();
    });

    test("sends the file once a certification authority is selected", async ({
      page,
    }) => {
      await goTo(page);

      await page
        .getByRole("combobox", {
          name: "SÉLECTIONNEZ L'AUTORITÉ DE CERTIFICATION",
        })
        .selectOption("ca-2");

      const mutationPromise = waitGraphQL(page, MUTATION_NAME);
      await page
        .getByRole("button", { name: "Envoyer au certificateur" })
        .click();
      await mutationPromise;

      await expect(page.getByTestId("toast-success")).toBeVisible();
      await expect(page).toHaveURL(SUMMARY_URL);
    });
  });

  test.describe("dossier not ready to be sent", () => {
    const feasibility = buildFeasibility({
      isReadyToBeSentToCertificationAuthority: false,
    });

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createFeasibilityQueryHandler(feasibility),
          successMutationHandler,
        ],
        { scope: "test" },
      ],
    });

    test("disables the submit button", async ({ page }) => {
      await goTo(page);
      await expect(
        page.getByRole("button", { name: "Envoyer au certificateur" }),
      ).toBeDisabled();
    });
  });

  test.describe("file already sent and pending decision", () => {
    const feasibility = buildFeasibility({
      decision: "PENDING",
      feasibilityFileSentAt: 1716984000000,
    });

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createFeasibilityQueryHandler(feasibility),
          successMutationHandler,
        ],
        { scope: "test" },
      ],
    });

    test("shows the sent banner, hides the selection section and disables submit", async ({
      page,
    }) => {
      await goTo(page);

      await expect(
        page.getByText("Dossier envoyé au certificateur le 29/05/2024"),
      ).toBeVisible();
      await expect(
        page.getByText("Certificateur Métiers Services"),
      ).not.toBeVisible();
      await expect(
        page.getByRole("button", { name: "Envoyer au certificateur" }),
      ).toBeDisabled();
    });
  });

  test.describe("file sent then returned incomplete", () => {
    const feasibility = buildFeasibility({
      decision: "INCOMPLETE",
      feasibilityFileSentAt: 1716984000000,
      decisionSentAt: 1717243200000,
      decisionComment: "Merci de compléter les pièces manquantes.",
    });

    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          createFeasibilityQueryHandler(feasibility),
          successMutationHandler,
        ],
        { scope: "test" },
      ],
    });

    test("shows the incomplete decision banner and allows resending the file", async ({
      page,
    }) => {
      await goTo(page);

      await expect(
        page.getByText("Dossier retourné incomplet le 01/06/2024"),
      ).toBeVisible();
      await expect(
        page.getByText("”Merci de compléter les pièces manquantes.”"),
      ).toBeVisible();

      await expect(
        page.getByText("Certificateur Métiers Services"),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Envoyer au certificateur" }),
      ).toBeEnabled();
    });
  });
});
