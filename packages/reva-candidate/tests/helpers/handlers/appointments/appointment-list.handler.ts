import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "@tests/helpers/network/msw";
import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";
import { waitGraphQL } from "@tests/helpers/network/requests";

import { Candidacy } from "@/graphql/generated/graphql";

export async function navigateToAppointmentListPage(
  page: Page,
  candidacyId: string,
) {
  await page.goto(`${candidacyId}/appointments/`);
}

interface DashboardHandlersOptions {
  candidacy: CandidacyEntity;
  activeFeaturesForConnectedUser?: string[];
  hasPastAppointments?: boolean;
}

const appointmentListWait = async (page: Page) => {
  const featuresQuery = waitGraphQL(page, "activeFeaturesForConnectedUser");

  const pastAppointmentsQuery = waitGraphQL(page, "getPastAppointments");

  const futureAppointmentsQuery = waitGraphQL(page, "getFutureAppointments");

  await Promise.all([
    featuresQuery,
    pastAppointmentsQuery,
    futureAppointmentsQuery,
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

  console.log(
    "candidacyWithoutPastAppointments",
    candidacyWithoutPastAppointments,
  );

  return {
    handlers: [
      fvae.query(
        "candidate_getCandidateWithCandidaciesForCandidaciesGuard",
        graphQLResolver({
          candidate_getCandidateWithCandidacy: {
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
      fvae.query(
        "getCandidacyByIdWithCandidateForHeader",
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
