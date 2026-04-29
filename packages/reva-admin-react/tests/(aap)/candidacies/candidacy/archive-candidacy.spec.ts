import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../shared/helpers/network/requests";

import type { Page } from "@playwright/test";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";

function createArchiveCandidacyHandlers() {
  return [
    fvae.query(
      "getCandidacyForArchivePage",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          status: "PROJET",
          financeModule: "unifvae",
          typeAccompagnement: "ACCOMPAGNE",
          reorientationReason: null,
          archivingReason: null,
          candidacyStatuses: [],
          candidate: {
            firstname: "John",
            lastname: "Doe",
          },
          certification: {
            codeRncp: "RNCP0001",
            label: "Certification 1",
          },
        },
      }),
    ),
    fvae.mutation(
      "archiveCandidacyById",
      graphQLResolver({
        candidacy_archiveById: {
          id: CANDIDACY_ID,
        },
      }),
    ),
  ];
}

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers({
  activeFeaturesForConnectedUser: ["CANDIDATE_DROP_OUT_V2"],
});

async function waitForArchiveCandidacyQueries(page: Page) {
  await waitGraphQL(page, "getCandidacyForArchivePage");
}

async function waitForAllQueries(page: Page) {
  await Promise.all([
    aapCommonWait(page),
    waitForArchiveCandidacyQueries(page),
  ]);
}

test.describe("archive candidacy page", () => {
  test.describe("when I access the candidacy archive page", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createArchiveCandidacyHandlers()],
        { scope: "test" },
      ],
    });

    test("test the archive candidacy flow when candidacy is in PROJET status", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/archive/`);
      await waitForAllQueries(page);

      const archiveCandidacyButton = page.getByRole("button", {
        name: "Enregistrer",
      });

      await expect(archiveCandidacyButton).toBeVisible();

      const selectArchivingReason = page.getByLabel("Motif de l'archivage :");

      await expect(selectArchivingReason).toBeVisible();

      await selectArchivingReason.selectOption("REPRISE_EMPLOI");

      await archiveCandidacyButton.click();

      const confirmArchiveCandidacyButton = page.getByRole("button", {
        name: "Confirmer",
      });

      await expect(confirmArchiveCandidacyButton).toBeVisible();

      await confirmArchiveCandidacyButton.click();

      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/summary/`,
      );
    });
  });
});
