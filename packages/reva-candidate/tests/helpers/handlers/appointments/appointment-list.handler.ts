import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";

export async function navigateToAppointmentListPage(
  page: Page,
  candidateId: string,
  candidacyId: string,
) {
  await page.goto(
    `candidates/${candidateId}/candidacies/${candidacyId}/appointments/`,
  );
}

interface DashboardHandlersOptions {
  candidacy: CandidacyEntity;
  activeFeaturesForConnectedUser?: string[];
  hasPastAppointments?: boolean;
}

const appointmentListWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getPastAppointments"),
    waitGraphQL(page, "getFutureAppointments"),
  ]);
};

export const appointmentListHandlers = ({
  candidacy,
  activeFeaturesForConnectedUser = [],
  hasPastAppointments = true,
}: DashboardHandlersOptions) => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  const candidacyWithoutPastAppointments = structuredClone(candidacy);
  if (candidacyWithoutPastAppointments.appointments) {
    candidacyWithoutPastAppointments.appointments.rows = [];
  }

  const candidacyInput = {
    getCandidacyById: candidacy,
  };

  const candidacyInputWithoutPastAppointments = {
    getCandidacyById: candidacyWithoutPastAppointments,
  };

  return {
    handlers: [
      fvae.query(
        "candidate_getCandidateForCandidatesGuard",
        graphQLResolver({
          candidate_getCandidateWithCandidacy: {
            ...candidacy.candidate,
          },
        }),
      ),
      fvae.query(
        "getCandidateByIdForCandidateGuard",
        graphQLResolver({
          candidate_getCandidateById: {
            ...candidacy.candidate,
          },
        }),
      ),
      fvae.query(
        "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
        graphQLResolver({
          candidate_getCandidateById: {
            candidacies: [candidacy],
          },
        }),
      ),
      fvae.query(
        "getCandidacyByIdForCandidacyGuard",
        graphQLResolver(candidacyInput),
      ),
      fvae.query(
        "getCandidacyByIdWithCandidate",
        graphQLResolver(candidacyInput),
      ),
      fvae.query("getFutureAppointments", graphQLResolver(candidacyInput)),
      fvae.query(
        "getPastAppointments",
        graphQLResolver(
          hasPastAppointments
            ? candidacyInput
            : candidacyInputWithoutPastAppointments,
        ),
      ),
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          activeFeaturesForConnectedUser,
        }),
      ),
    ],
    appointmentListWait,
  };
};
