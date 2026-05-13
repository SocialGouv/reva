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

function createEndAccompagnementHandlers(args?: {
  withFeasibilityDecisionPending?: boolean;
  withEndAccompagnementRequested?: boolean;
}) {
  return [
    fvae.query(
      "getCandidacyEndAccompagnementById",
      graphQLResolver({
        getCandidacyById: {
          candidate: {
            firstname: "John",
            lastname: "Doe",
          },
          endAccompagnementDate: null,
          endAccompagnementStatus: args?.withEndAccompagnementRequested
            ? "PENDING"
            : "NOT_REQUESTED",
          endAccompagnementReason: args?.withEndAccompagnementRequested
            ? "CONTRAT_ACCOMPAGNEMENT_TERMINE"
            : null,
          endAccompagnementCandidateDropOutReason:
            args?.withEndAccompagnementRequested
              ? {
                  id: "reason-1",
                  label: "Motif d'abandon",
                }
              : null,
          certification: {
            codeRncp: "1234567890",
            label: "Certification",
          },
          feasibility: args?.withFeasibilityDecisionPending
            ? {
                decision: "PENDING",
                feasibilityFileSentAt: new Date().getTime(),
              }
            : null,
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
      "submitEndAccompagnement",
      graphQLResolver({
        candidacy_submitEndAccompagnement: {
          id: CANDIDACY_ID,
        },
      }),
    ),
  ];
}

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

async function waitForAppointmentQueries(page: Page) {
  await Promise.all([
    waitGraphQL(page, "getCandidacyEndAccompagnementById"),
    waitGraphQL(page, "getDropOutReasons"),
  ]);
}

async function waitForAllQueries(page: Page) {
  await Promise.all([aapCommonWait(page), waitForAppointmentQueries(page)]);
}

test.describe("end accompagnement page", () => {
  test.describe("when I access the end accompagnement page", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createEndAccompagnementHandlers()],
        { scope: "test" },
      ],
    });

    test("show the correct title", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/end-accompagnement/`,
      );
      await waitForAllQueries(page);

      await expect(
        page.getByTestId("end-accompagnement-page").getByRole("heading", {
          level: 1,
        }),
      ).toHaveText("Fin d'accompagnement");
    });
  });

  test.describe("when the feasibility decision is pending", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createEndAccompagnementHandlers({
            withFeasibilityDecisionPending: true,
          }),
        ],
        { scope: "test" },
      ],
    });

    test("show the end accompagnement unavailable component", async ({
      page,
    }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/end-accompagnement/`,
      );
      await waitForAllQueries(page);

      await expect(
        page
          .getByTestId("end-accompagnement-page")
          .getByText(
            "Vous ne pouvez pas déclarer de fin d’accompagnement à cette étape.",
          ),
      ).toBeVisible();
    });
  });

  test.describe("when the end accompagnement is not requested", () => {
    test.use({
      mswHandlers: [
        [...aapCommonHandlers, ...createEndAccompagnementHandlers()],
        { scope: "test" },
      ],
    });

    test("submit the end accompagnement form", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/end-accompagnement/`,
      );
      await waitForAllQueries(page);

      await expect(
        page
          .getByTestId("end-accompagnement-page")
          .getByText("Date de fin d'accompagnement"),
      ).toBeVisible();

      const buttonValidateEndAccompagnement = page.getByRole("button", {
        name: "Valider",
      });
      await expect(buttonValidateEndAccompagnement).toBeVisible();
      await expect(buttonValidateEndAccompagnement).not.toBeEnabled();

      const inputEndAccompagnementDate = page.getByLabel(
        "Date de fin d'accompagnement :",
      );
      await expect(inputEndAccompagnementDate).toBeVisible();
      await inputEndAccompagnementDate.fill("2026-01-01");

      await expect(buttonValidateEndAccompagnement).toBeEnabled();
      await buttonValidateEndAccompagnement.click();

      await expect(
        page.getByText("Veuillez sélectionner un motif"),
      ).toBeVisible();

      const selectEndAccompagnementReason = page.getByLabel(
        "Motif de la fin d'accompagnement",
      );
      await expect(selectEndAccompagnementReason).toBeVisible();
      await selectEndAccompagnementReason.selectOption(
        "CONTRAT_ACCOMPAGNEMENT_TERMINE",
      );

      await buttonValidateEndAccompagnement.click();

      const buttonFermerAccompagnement = page.getByRole("button", {
        name: "Fermer",
      });
      await expect(buttonFermerAccompagnement).toBeVisible();
      await buttonFermerAccompagnement.click();

      const checkboxIsCandidateDropOut = page.getByText(
        "La fin de l’accompagnement est liée à un abandon de la candidature signalé par le candidat",
      );
      await expect(checkboxIsCandidateDropOut).toBeVisible();
      await checkboxIsCandidateDropOut.check();

      await buttonValidateEndAccompagnement.click();

      await expect(
        page.getByText("Veuillez sélectionner un motif"),
      ).toBeVisible();

      const selectEndAccompagnementCandidateDropOutReason =
        page.getByLabel("Motif de l'abandon");
      await expect(selectEndAccompagnementCandidateDropOutReason).toBeVisible();
      await selectEndAccompagnementCandidateDropOutReason.selectOption(
        "reason-1",
      );

      await buttonValidateEndAccompagnement.click();

      const buttonConfirmEndAccompagnement = page.getByRole("button", {
        name: "Confirmer",
      });
      await expect(buttonConfirmEndAccompagnement).toBeVisible();
      await buttonConfirmEndAccompagnement.click();

      await expect(page).toHaveURL(
        `/admin2/candidacies/${CANDIDACY_ID}/summary/`,
      );
    });
  });

  test.describe("when the end accompagnement is requested", () => {
    test.use({
      mswHandlers: [
        [
          ...aapCommonHandlers,
          ...createEndAccompagnementHandlers({
            withEndAccompagnementRequested: true,
          }),
        ],
        { scope: "test" },
      ],
    });

    test("submit the end accompagnement form", async ({ page }) => {
      await login({ role: "aap", page });
      await page.goto(
        `/admin2/candidacies/${CANDIDACY_ID}/end-accompagnement/`,
      );
      await waitForAllQueries(page);

      await expect(
        page
          .getByTestId("end-accompagnement-page")
          .getByText("Date de fin d'accompagnement déclarée"),
      ).toBeVisible();

      await expect(
        page
          .getByTestId("end-accompagnement-page")
          .getByText("Motif d'abandon"),
      ).toBeVisible();
    });
  });
});
