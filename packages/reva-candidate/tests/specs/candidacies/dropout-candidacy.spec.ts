import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import {
  CandidacyEntity,
  createCandidacyEntity,
} from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { createFeasibilityEntity } from "@tests/helpers/entities/create-feasibility.entity";
import {
  createCandidacyGuardsAndDashboardHandlers,
  createCandidaciesGuardsHandlers,
  loginAndWaitForCandidaciesInitialLoad,
} from "@tests/helpers/handlers/candidacies/candidacies-guards.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";

import { CandidacyStatusStep } from "@/graphql/generated/graphql";

const fvae = graphql.link("https://reva-api/api/graphql");

const candidate = createCandidateEntity();

function createCandidaciesHandlers(args?: {
  candidacy: CandidacyEntity;
  activeFeaturesForConnectedUser?: string[];
}) {
  return [
    ...createCandidaciesGuardsHandlers({
      candidate,
      candidacies: args?.candidacy ? [args.candidacy] : [],
      activeFeaturesForConnectedUser: args?.activeFeaturesForConnectedUser,
    }),
    ...createCandidacyGuardsAndDashboardHandlers(args?.candidacy ?? null),
    fvae.mutation(
      "dropOutCandidacyById",
      graphQLResolver({
        dropOutCandidacyById: { id: args?.candidacy?.id ?? null },
      }),
    ),
    fvae.query(
      "getCandidacyByIdWithCandidateForDropout",
      graphQLResolver({
        getCandidacyById: {
          ...args?.candidacy,
        },
      }),
    ),
    fvae.query(
      "getDropOutReasons",
      graphQLResolver({
        getDropOutReasons: [
          {
            id: "reason-1",
            label: "Motif d'abandon",
            isActive: true,
          },
        ],
      }),
    ),
    fvae.mutation(
      "candidacy_candidateDropOutCandidacy",
      graphQLResolver({
        candidacy_candidateDropOutCandidacy: {
          id: args?.candidacy?.id ?? null,
        },
      }),
    ),
  ];
}

// 107d95ee-6384-45da-9b1a-f9361cc60741	Reprise d’emploi	2022-12-29 13:03:13.58+00	NULL	true
test.describe("drop out candidacy before feasibility file sent", () => {
  const certification = createCertificationEntity({
    label: "Certification 1",
    codeRncp: "RNCP0001",
  });
  const candidacy = createCandidacyEntity({
    candidate,
    certification,
    status: "PRISE_EN_CHARGE",
  });

  test.use({
    mswHandlers: [
      createCandidaciesHandlers({
        candidacy,
        activeFeaturesForConnectedUser: ["CANDIDATE_DROP_OUT_V2"],
      }),
      { scope: "test" },
    ],
  });

  test("test the drop out candidacy flow when candidacy is not in PROJET status and has no feasibility file sent", async ({
    page,
  }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);

    await page.goto(`candidates/${candidate.id}/candidacies/${candidacy.id}/`);

    const dropOutCandidacyButton = page.getByRole("button", {
      name: "Abandon de la candidature",
    });

    await expect(dropOutCandidacyButton).toBeVisible();

    await dropOutCandidacyButton.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/dropout/`,
    );

    const confirmDropOutCandidacyButton = page.getByRole("button", {
      name: "Confirmer",
    });

    await expect(confirmDropOutCandidacyButton).toBeVisible();

    await confirmDropOutCandidacyButton.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/dropout/`,
    );

    const selectDropOutReason = page.getByLabel("Motif de l'abandon :");

    await expect(selectDropOutReason).toBeVisible();

    await selectDropOutReason.selectOption("reason-1");

    await confirmDropOutCandidacyButton.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/`,
    );
  });
});

test.describe("drop out candidacy after feasibility file sent", () => {
  const certification = createCertificationEntity({
    label: "Certification 1",
    codeRncp: "RNCP0001",
  });
  const candidacy = createCandidacyEntity({
    candidate,
    certification,
    status: "DOSSIER_FAISABILITE_ENVOYE",
    feasibility: createFeasibilityEntity({
      decision: "PENDING",
      feasibilityFileSentAt: Date.now(),
    }),
  });

  test.use({
    mswHandlers: [
      createCandidaciesHandlers({
        candidacy,
        activeFeaturesForConnectedUser: ["CANDIDATE_DROP_OUT_V2"],
      }),
      { scope: "test" },
    ],
  });

  test("test the drop out candidacy flow when candidacy is in DOSSIER_FAISABILITE_ENVOYE status and has feasibility file sent", async ({
    page,
  }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);

    await page.goto(`candidates/${candidate.id}/candidacies/${candidacy.id}/`);

    const dropOutCandidacyButton = page.getByRole("button", {
      name: "Abandon de la candidature",
    });

    await expect(dropOutCandidacyButton).toBeVisible();

    await dropOutCandidacyButton.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/dropout/`,
    );

    const dropOutCandidacyWarning = page.getByText(
      "Vous ne pouvez pas abandonner à cette étape.",
    );

    await expect(dropOutCandidacyWarning).toBeVisible();
  });
});

const FEASIBILITY_DECISION_MADE_STATUSES = [
  "DOSSIER_FAISABILITE_INCOMPLET",
  "DOSSIER_FAISABILITE_RECEVABLE",
  "DOSSIER_FAISABILITE_NON_RECEVABLE",
  "DOSSIER_DE_VALIDATION_ENVOYE",
  "DOSSIER_DE_VALIDATION_SIGNALE",
];

for (const status of FEASIBILITY_DECISION_MADE_STATUSES) {
  test.describe(`drop out candidacy after ${status} status`, () => {
    const certification = createCertificationEntity({
      label: "Certification 1",
      codeRncp: "RNCP0001",
    });
    const candidacy = createCandidacyEntity({
      candidate,
      certification,
      status: status as CandidacyStatusStep,
    });

    test.use({
      mswHandlers: [
        createCandidaciesHandlers({
          candidacy,
          activeFeaturesForConnectedUser: ["CANDIDATE_DROP_OUT_V2"],
        }),
        { scope: "test" },
      ],
    });

    test(`test the drop out candidacy flow when candidacy is in ${status} status`, async ({
      page,
    }) => {
      await loginAndWaitForCandidaciesInitialLoad(page);

      await page.goto(
        `candidates/${candidate.id}/candidacies/${candidacy.id}/`,
      );
      const dropOutCandidacyButton = page.getByRole("button", {
        name: "Abandon de la candidature",
      });

      await expect(dropOutCandidacyButton).toBeVisible();

      await dropOutCandidacyButton.click();

      await expect(page).toHaveURL(
        `candidates/${candidate.id}/candidacies/${candidacy.id}/dropout/`,
      );

      const confirmDropOutCandidacyButton = page.getByRole("button", {
        name: "Confirmer",
      });

      await expect(confirmDropOutCandidacyButton).toBeVisible();

      await confirmDropOutCandidacyButton.click();

      await expect(page).toHaveURL(
        `candidates/${candidate.id}/candidacies/${candidacy.id}/dropout/`,
      );

      const selectDropOutReason = page.getByLabel("Motif de l'abandon :");

      await expect(selectDropOutReason).toBeVisible();

      await selectDropOutReason.selectOption("reason-1");

      await confirmDropOutCandidacyButton.click();

      await expect(page).toHaveURL(
        `candidates/${candidate.id}/candidacies/${candidacy.id}/`,
      );
    });
  });
}
