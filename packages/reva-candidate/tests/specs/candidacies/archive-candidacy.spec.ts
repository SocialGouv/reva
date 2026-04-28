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
import {
  createCandidacyGuardsAndDashboardHandlers,
  createCandidaciesGuardsHandlers,
  loginAndWaitForCandidaciesInitialLoad,
} from "@tests/helpers/handlers/candidacies/candidacies-guards.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";

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
      "archiveCandidacyById",
      graphQLResolver({
        archiveCandidacyById: { id: args?.candidacy?.id ?? null },
      }),
    ),
  ];
}

test.describe("archive candidacy with feasibility file sent", () => {
  const certification = createCertificationEntity({
    label: "Certification 1",
    codeRncp: "RNCP0001",
  });
  const candidacy = createCandidacyEntity({
    candidate,
    certification,
    status: "PROJET",
    feasibility: {
      feasibilityFileSentAt: new Date().getTime(),
    },
  });

  test.use({
    mswHandlers: [createCandidaciesHandlers({ candidacy }), { scope: "test" }],
  });

  test("when i access the page it shows one candidacy card, click on it and redirects to the candidacy page without archive button", async ({
    page,
  }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);

    await page.goto(`candidates/${candidate.id}/candidacies/`);

    const candidacyCard = page.getByText(
      `RNCP ${certification.codeRncp} : ${certification.label}`,
    );
    await expect(candidacyCard).toBeVisible();
    await candidacyCard.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/`,
    );

    const abandonCandidacyButton = page.getByRole("button", {
      name: "Abandonner cette candidature",
    });

    await expect(abandonCandidacyButton).not.toBeVisible();
  });
});

test.describe("archive candidacy without feasibility file sent", () => {
  const certification = createCertificationEntity({
    label: "Certification 1",
    codeRncp: "RNCP0001",
  });
  const candidacy = createCandidacyEntity({
    candidate,
    certification,
    status: "PROJET",
  });

  test.use({
    mswHandlers: [createCandidaciesHandlers({ candidacy }), { scope: "test" }],
  });

  test("when i access the page it shows one candidacy card, click on it and redirects to the candidacy page with archive button", async ({
    page,
  }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);

    await page.goto(`candidates/${candidate.id}/candidacies/`);

    const candidacyCard = page.getByText(
      `RNCP ${certification.codeRncp} : ${certification.label}`,
    );
    await expect(candidacyCard).toBeVisible();
    await candidacyCard.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/`,
    );

    const abandonCandidacyButton = page.getByRole("button", {
      name: "Abandonner cette candidature",
    });

    await expect(abandonCandidacyButton).toBeVisible();

    await abandonCandidacyButton.click();

    const confirmAbandonCandidacyButton = page.getByRole("button", {
      name: "Confirmer",
    });

    await expect(confirmAbandonCandidacyButton).toBeVisible();

    await confirmAbandonCandidacyButton.click();

    await expect(page).toHaveURL(`candidates/${candidate.id}/candidacies/`);
  });
});

test.describe("archive candidacy with candidate drop out v2 enabled", () => {
  const certification = createCertificationEntity({
    label: "Certification 1",
    codeRncp: "RNCP0001",
  });
  const candidacy = createCandidacyEntity({
    candidate,
    certification,
    status: "PROJET",
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

  test("when i access the page it shows one candidacy card, click on it and redirects to the candidacy page without archive button", async ({
    page,
  }) => {
    await loginAndWaitForCandidaciesInitialLoad(page);

    await page.goto(`candidates/${candidate.id}/candidacies/`);

    const candidacyCard = page.getByText(
      `RNCP ${certification.codeRncp} : ${certification.label}`,
    );
    await expect(candidacyCard).toBeVisible();
    await candidacyCard.click();

    await expect(page).toHaveURL(
      `candidates/${candidate.id}/candidacies/${candidacy.id}/`,
    );

    const candidateDropOutButton = page.getByRole("button", {
      name: "Suppression de la candidature",
    });

    await expect(candidateDropOutButton).toBeVisible();
  });
});
