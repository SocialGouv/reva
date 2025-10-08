import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "@tests/helpers/auth/auth";
import { createCandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { createCandidateEntity } from "@tests/helpers/entities/create-candidate.entity";
import { createCertificationEntity } from "@tests/helpers/entities/create-certification.entity";
import { createOrganismEntity } from "@tests/helpers/entities/create-organism.entity";
import { dashboardHandlers } from "@tests/helpers/handlers/dashboard.handler";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import { Candidacy, Candidate, Organism } from "@/graphql/generated/graphql";

const fvae = graphql.link("https://reva-api/api/graphql");

function buildEndAccompagnementQueryPayload({
  endAccompagnementStatus = "PENDING",
  modaliteAccompagnement = "A_DISTANCE",
  decisionSentAt = null as number | null,
}: {
  endAccompagnementStatus?:
    | "PENDING"
    | "CONFIRMED_BY_CANDIDATE"
    | "CONFIRMED_BY_ADMIN";
  modaliteAccompagnement?: "A_DISTANCE" | "LIEU_ACCUEIL" | null;
  decisionSentAt?: number | null;
}) {
  return {
    candidate_getCandidateWithCandidacy: {
      firstname: "Alice",
      firstname2: null,
      firstname3: null,
      lastname: "Durand",
      givenName: "Mme",
      department: { label: "Gironde", code: "33" },
      candidacy: {
        id: "cand-1",
        endAccompagnementStatus,
        certification: {
          codeRncp: "12345",
          label: "Certification Test",
        },
        feasibility: {
          decisionSentAt,
        },
        organism: {
          modaliteAccompagnement,
          label: "Organisme Test",
        },
      },
    },
  };
}

test.describe.skip("End accompagnement page", () => {
  test.describe("rendering and content", () => {
    const candidate = createCandidateEntity() as Candidate;
    const candidacy = createCandidacyEntity({
      candidate,
      status: "PROJET",
      certification: createCertificationEntity(),
      organism: createOrganismEntity() as Organism,
    }) as Candidacy;

    const { handlers, dashboardWait } = dashboardHandlers({
      candidacy,
      activeFeaturesForConnectedUser: [],
    });
    test.use({
      mswHandlers: [
        [
          ...handlers,
          fvae.query(
            "candidate_getCandidateWithCandidacyForEndAccompagnement",
            graphQLResolver({ data: buildEndAccompagnementQueryPayload({}) }),
          ),
          fvae.mutation(
            "candidacy_updateCandidacyEndAccompagnementDecision",
            graphQLResolver({
              data: {
                candidacy_updateCandidacyEndAccompagnementDecision: {
                  id: "cand-1",
                },
              },
            }),
          ),
        ],
        { scope: "test" },
      ],
    });

    test("displays candidate card, details and radio group when PENDING", async ({
      page,
    }) => {
      await login(page);
      await dashboardWait(page);
      await page.goto("end-accompagnement/");

      await expect(
        page.getByRole("heading", { name: "Fin d'accompagnement" }),
      ).toBeVisible();

      // Card content
      await expect(page.getByText("Alice", { exact: false })).toBeVisible();
      await expect(page.getByText("Durand", { exact: false })).toBeVisible();
      await expect(page.getByText("Organisme Test")).toBeVisible();
      await expect(page.getByText("Gironde (33)")).toBeVisible();
      await expect(
        page.getByText("RNCP 12345 : Certification Test"),
      ).toBeVisible();
      // A_DISTANCE badge by default
      await expect(page.getByText("À distance")).toBeVisible();

      // Radios + submit
      const radios = page.locator(
        '[data-test="candidacy-inactif-radio-buttons"]',
      );
      await expect(radios).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Confirmer la décision" }),
      ).toBeVisible();
    });
  });

  test.describe("badges and details variants", () => {
    const candidate = createCandidateEntity() as Candidate;
    const candidacy = createCandidacyEntity({
      candidate,
      status: "PROJET",
      certification: createCertificationEntity(),
      organism: createOrganismEntity() as Organism,
    }) as Candidacy;

    const { handlers, dashboardWait } = dashboardHandlers({
      candidacy,
      activeFeaturesForConnectedUser: [],
    });
    test.use({
      mswHandlers: [
        [
          ...handlers,
          fvae.query(
            "candidate_getCandidateWithCandidacyForEndAccompagnement",
            graphQLResolver({
              data: buildEndAccompagnementQueryPayload({
                modaliteAccompagnement: "LIEU_ACCUEIL",
              }),
            }),
          ),
        ],
        { scope: "test" },
      ],
    });

    test("shows 'Sur site' badge when modalite is LIEU_ACCUEIL", async ({
      page,
    }) => {
      await login(page);
      await dashboardWait(page);
      await page.goto("end-accompagnement/");
      await expect(page.getByText("Sur site")).toBeVisible();
    });

    test.use({
      mswHandlers: [
        [
          ...handlers,
          fvae.query(
            "candidate_getCandidateWithCandidacyForEndAccompagnement",
            graphQLResolver({
              data: buildEndAccompagnementQueryPayload({
                decisionSentAt: new Date("2024-01-15T00:00:00Z").getTime(),
              }),
            }),
          ),
        ],
        { scope: "test" },
      ],
    });

    test("shows receivable date when feasibility.decisionSentAt present", async ({
      page,
    }) => {
      await login(page);
      await dashboardWait(page);
      await page.goto("end-accompagnement/");
      await expect(page.getByText(/Recevable le 15\/01\/2024/)).toBeVisible();
    });
  });

  test.describe("validation and submission", () => {
    const candidate = createCandidateEntity() as Candidate;
    const candidacy = createCandidacyEntity({
      candidate,
      status: "PROJET",
      certification: createCertificationEntity(),
      organism: createOrganismEntity() as Organism,
    }) as Candidacy;

    const { handlers, dashboardWait } = dashboardHandlers({
      candidacy,
      activeFeaturesForConnectedUser: [],
    });
    test.use({
      mswHandlers: [
        [
          ...handlers,
          fvae.query(
            "candidate_getCandidateWithCandidacyForEndAccompagnement",
            graphQLResolver({ data: buildEndAccompagnementQueryPayload({}) }),
          ),
          fvae.mutation(
            "candidacy_updateCandidacyEndAccompagnementDecision",
            graphQLResolver({
              data: {
                candidacy_updateCandidacyEndAccompagnementDecision: {
                  id: "cand-1",
                },
              },
            }),
          ),
        ],
        { scope: "test" },
      ],
    });

    test("shows zod error when submitting without selecting an option", async ({
      page,
    }) => {
      await login(page);
      await dashboardWait(page);
      await page.goto("end-accompagnement/");

      await page.getByRole("button", { name: "Confirmer la décision" }).click();
      await expect(
        page.getByText("Veuillez sélectionner une option"),
      ).toBeVisible();
    });

    test("CONFIRMED: submits mutation and redirects to home with toast", async ({
      page,
    }) => {
      await login(page);
      await dashboardWait(page);
      await page.goto("end-accompagnement/");

      await page.getByLabel("Oui, mon accompagnement est terminé.").check();
      const submit = page.getByRole("button", {
        name: "Confirmer la décision",
      });
      await Promise.all([
        waitGraphQL(page, "candidacy_updateCandidacyEndAccompagnementDecision"),
        submit.click(),
      ]);

      await expect(page.getByText("Décision enregistrée")).toBeVisible();
      await expect(page).toHaveURL(`/candidat/${candidacy.id}/`);
    });

    test("REFUSED: submits mutation and redirects to home with toast", async ({
      page,
    }) => {
      await login(page);
      await dashboardWait(page);
      await page.goto("end-accompagnement/");

      await page
        .getByLabel("Non, je souhaite continuer mon accompagnement.")
        .check();
      const submit = page.getByRole("button", {
        name: "Confirmer la décision",
      });
      await Promise.all([
        waitGraphQL(page, "candidacy_updateCandidacyEndAccompagnementDecision"),
        submit.click(),
      ]);

      await expect(page.getByText("Décision enregistrée")).toBeVisible();
      await expect(page).toHaveURL(`/candidat/${candidacy.id}/`);
    });
  });

  test.describe("redirect and empty states", () => {
    const candidate = createCandidateEntity() as Candidate;
    const candidacy = createCandidacyEntity({
      candidate,
      status: "PROJET",
      certification: createCertificationEntity(),
      organism: createOrganismEntity() as Organism,
    }) as Candidacy;

    const { handlers, dashboardWait } = dashboardHandlers({
      candidacy,
      activeFeaturesForConnectedUser: [],
    });
    test.use({
      mswHandlers: [
        [
          ...handlers,
          fvae.query(
            "candidate_getCandidateWithCandidacyForEndAccompagnement",
            graphQLResolver({
              data: buildEndAccompagnementQueryPayload({
                endAccompagnementStatus: "CONFIRMED_BY_CANDIDATE",
              }),
            }),
          ),
        ],
        { scope: "test" },
      ],
    });

    test("redirects to home when end accompagnement is not PENDING", async ({
      page,
    }) => {
      await login(page);
      await dashboardWait(page);
      await page.goto("end-accompagnement/");
      await expect(page).toHaveURL(`/candidat/${candidacy.id}/`);
    });

    test.use({
      mswHandlers: [
        [
          ...handlers,
          fvae.query(
            "candidate_getCandidateWithCandidacyForEndAccompagnement",
            graphQLResolver({
              data: { candidate_getCandidateWithCandidacy: null },
            }),
          ),
        ],
        { scope: "test" },
      ],
    });

    test("renders nothing when candidate is null", async ({ page }) => {
      await login(page);
      await dashboardWait(page);
      await page.goto("end-accompagnement/");
      await expect(
        page.locator('[data-test="candidacy-inactif-radio-buttons"]'),
      ).toHaveCount(0);
      await expect(page).toHaveURL(
        `/candidat/${candidacy.id}/end-accompagnement/`,
      );
    });
  });

  test.describe("dashboard OrganismTile integration (end accompagnement confirmed)", () => {
    const candidate = createCandidateEntity() as Candidate;
    const candidacy = createCandidacyEntity({
      candidate,
      status: "PROJET",
      certification: createCertificationEntity(),
      organism: createOrganismEntity() as Organism,
    }) as Candidacy;

    const { handlers, dashboardWait } = dashboardHandlers({
      candidacy,
      activeFeaturesForConnectedUser: [],
    });
    test.use({
      mswHandlers: [
        [
          ...handlers,
          // Overwrite dashboard query to reflect confirmed end accompagnement, so tile shows tag
          fvae.query(
            "candidate_getCandidateWithCandidacyForDashboard",
            graphQLResolver({
              data: {
                candidate_getCandidateWithCandidacy: {
                  candidacy: {
                    status: "PROJET",
                    typeAccompagnement: "ACCOMPAGNE",
                    goals: [{ id: "g1" }],
                    experiences: [{ id: "e1" }],
                    organism: { id: "o1", label: "Organisme Test" },
                    feasibility: null,
                    certification: {
                      id: "c1",
                      label: "Certif",
                      codeRncp: "123",
                    },
                    activeDossierDeValidation: null,
                    certificationAuthorityLocalAccounts: [],
                    jury: null,
                    sentAt: null,
                    readyForJuryEstimatedAt: null,
                    firstAppointmentOccuredAt: null,
                    candidacyStatuses: [],
                    candidacyDropOut: null,
                    endAccompagnementStatus: "CONFIRMED_BY_CANDIDATE",
                    endAccompagnementDate: null,
                  },
                },
              },
            }),
          ),
        ],
        { scope: "test" },
      ],
    });

    test("shows 'Accompagnement terminé' tag on organism tile when confirmed", async ({
      page,
    }) => {
      await login(page);
      await dashboardWait(page);
      // After login, home/dashboard should be visible
      await expect(
        page.locator('[data-test="dashboard-sidebar"]'),
      ).toBeVisible();
      const organismTile = page.locator('[data-test="organism-tile"]');
      await expect(organismTile).toBeVisible();
      await expect(
        organismTile.getByText("Accompagnement terminé"),
      ).toBeVisible();
    });
  });
});
