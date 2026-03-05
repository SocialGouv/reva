import {
  expect,
  graphql,
  test,
} from "next/experimental/testmode/playwright/msw";

import { login } from "../../../../shared/helpers/auth/login";
import { getAAPCommonHandlers } from "../../../../shared/helpers/common-handlers/aap/getAapCommon.handlers";
import { graphQLResolver } from "../../../../shared/helpers/network/msw";
import { waitGraphQL } from "../../../../shared/helpers/network/requests";

const fvae = graphql.link("https://reva-api/api/graphql");

const CANDIDACY_ID = "fb451fbc-3218-416d-9ac9-65b13432469f";
const EXPECTED_ADDRESS = "1 rue de la Paix, 75001 Paris, Île-de-France";

const DEFAULT_CANDIDATE = {
  id: "candidate-1",
  firstname: "John",
  lastname: "Doe",
  street: "1 rue de la Paix",
  city: "Paris",
  zip: "75001",
  department: { id: "dep-75", label: "Île-de-France", code: "75" },
};

type CandidateInfo = {
  street: string | null;
  city: string | null;
  zip: string | null;
  addressComplement: string | null;
};

function createSummaryHandlers(candidateInfo: CandidateInfo | null) {
  return [
    fvae.query(
      "getCandidacySummaryById",
      graphQLResolver({
        getCandidacyById: {
          id: CANDIDACY_ID,
          financeModule: "unifvae",
          typeAccompagnement: "ACCOMPAGNE",
          endAccompagnementStatus: null,
          endAccompagnementDate: null,
          certificationAuthorityLocalAccounts: [],
          candidacyDropOut: null,
          reorientationReason: null,
          organism: {
            label: "Organism Label",
            contactAdministrativeEmail: "contact@example.com",
            emailContact: "contact@example.com",
            nomPublic: "Organism Label",
            maisonMereAAP: { id: "mm-1" },
          },
          status: "PRISE_EN_CHARGE",
          certification: {
            id: "cert-1",
            codeRncp: "RNCP1234",
            label: "Certification Label",
          },
          candidateInfo,
          candidate: DEFAULT_CANDIDATE,
          experiences: [],
          goals: [],
          feasibilityFormat: "DEMATERIALIZED",
          feasibility: null,
        },
      }),
    ),
  ];
}

const { aapCommonHandlers, aapCommonWait } = getAAPCommonHandlers();

const scenarios = [
  {
    name: "when candidacy snapshot is empty but candidate has address)",
    candidateInfo: {
      street: null,
      city: null,
      zip: null,
      addressComplement: null,
    },
  },
  {
    name: "when candidacy snapshot and candidate addresses are both filled",
    candidateInfo: {
      street: DEFAULT_CANDIDATE.street,
      city: DEFAULT_CANDIDATE.city,
      zip: DEFAULT_CANDIDATE.zip,
      addressComplement: null,
    },
  },
];

test.describe("Candidate information address display", () => {
  scenarios.forEach(({ name, candidateInfo }) => {
    test.describe(name, () => {
      test.use({
        mswHandlers: [
          [...createSummaryHandlers(candidateInfo), ...aapCommonHandlers],
          { scope: "test" },
        ],
      });

      test("should display candidate address", async ({ page }) => {
        await login({ role: "aap", page });
        await page.goto(`/admin2/candidacies/${CANDIDACY_ID}/summary/`);
        await Promise.all([
          aapCommonWait(page),
          waitGraphQL(page, "getCandidacySummaryById"),
        ]);

        const card = page.getByTestId("candidate-information");
        await expect(card).toContainText(EXPECTED_ADDRESS);
        await expect(card).not.toContainText("null");
      });
    });
  });
});
