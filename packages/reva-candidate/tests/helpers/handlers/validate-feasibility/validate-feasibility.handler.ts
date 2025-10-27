import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import confirmCandidateFixture from "@tests/fixtures/candidate/validate-feasibility/dematerialized-feasibility-file-confirm-candidate.json";
import createOrUpdateSwornStatementFixture from "@tests/fixtures/candidate/validate-feasibility/dematerialized-feasibility-file-create-or-update-sworn-statement.json";
import getCandidacyByIdForCandidacyGuard from "@tests/fixtures/candidate/validate-feasibility/get-candidacy-by-id-for-candidacy-guard.json";
import getCandidacyByIdWithCandidateForValidateFeasibility from "@tests/fixtures/candidate/validate-feasibility/get-candidacy-by-id-with-candidate-for-validate-feasibility.json";
import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

const validateFeasibilityWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "getCandidacyByIdForCandidacyGuard"),
    waitGraphQL(page, "getCandidacyByIdWithCandidateForValidateFeasibility"),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
  ]);
};

export const navigateToValidateFeasibility = async (
  page: Page,
  candidateId: string,
  candidacyId: string,
) => {
  await page.goto(
    `candidates/${candidateId}/candidacies/${candidacyId}/validate-feasibility/`,
  );
};

export const validateFeasibilityHandlers = () => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  const candidacyWithCandidate =
    getCandidacyByIdWithCandidateForValidateFeasibility.data.getCandidacyById;
  const candidate = candidacyWithCandidate.candidate;

  const candidacyId = candidacyWithCandidate.id;
  const candidateId = candidate.id;

  return {
    handlers: [
      fvae.query(
        "candidate_getCandidateForCandidatesGuard",
        graphQLResolver({
          candidate_getCandidateWithCandidacy: {
            ...candidate,
          },
        }),
      ),
      fvae.query(
        "getCandidateByIdForCandidateGuard",
        graphQLResolver({
          candidate_getCandidateById: {
            ...candidate,
          },
        }),
      ),
      fvae.query(
        "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
        graphQLResolver({
          candidate_getCandidateById: {
            candidacies: [candidacyWithCandidate],
          },
        }),
      ),
      fvae.query(
        "getCandidacyByIdForCandidacyGuard",
        graphQLResolver(getCandidacyByIdForCandidacyGuard),
      ),
      fvae.query(
        "getCandidacyByIdWithCandidateForValidateFeasibility",
        graphQLResolver(getCandidacyByIdWithCandidateForValidateFeasibility),
      ),
      fvae.mutation(
        "candidate_loginWithToken",
        graphQLResolver({ candidate_loginWithToken: null }),
      ),
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          data: {
            activeFeaturesForConnectedUser: [
              "USE_GENERATED_DFF_FILE_FROM_FILE_SERVER",
            ],
          },
        }),
      ),
      fvae.mutation(
        "dematerialized_feasibility_file_createOrUpdateSwornStatement",
        graphQLResolver(createOrUpdateSwornStatementFixture),
      ),
      fvae.mutation(
        "dematerialized_feasibility_file_confirmCandidate",
        graphQLResolver(confirmCandidateFixture),
      ),
    ],
    candidacyId,
    candidateId,
    validateFeasibilityWait,
  };
};
