import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import { Appointment, Candidacy } from "@/graphql/generated/graphql";

export async function navigateToAppointmentDetailsPage(
  page: Page,
  candidacyId: string,
  appointmentId: string,
) {
  await page.goto(`${candidacyId}/appointments/${appointmentId}/`);
}

interface AppointmentDetailsHandlersOptions {
  candidacy: Partial<Candidacy>;
  appointment: Partial<Appointment>;
  activeFeaturesForConnectedUser?: string[];
}

const appointmentDetailsWait = async (page: Page) => {
  const featuresQuery = waitGraphQL(page, "activeFeaturesForConnectedUser");

  const pastAppointmentsQuery = waitGraphQL(page, "getOrganism");

  const futureAppointmentsQuery = waitGraphQL(page, "getAppointmentDetails");

  await Promise.all([
    featuresQuery,
    pastAppointmentsQuery,
    futureAppointmentsQuery,
  ]);
};

export const appointmentDetailsHandlers = ({
  candidacy,
  appointment,
  activeFeaturesForConnectedUser = [],
}: AppointmentDetailsHandlersOptions) => {
  const fvae = graphql.link("https://reva-api/api/graphql");

  const candidacyInput = {
    getCandidacyById: candidacy,
  };

  const appointmentInput = {
    appointment_getAppointmentById: appointment,
  };

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
      fvae.query("getOrganism", graphQLResolver(candidacyInput)),
      fvae.query("getAppointmentDetails", graphQLResolver(appointmentInput)),
      fvae.query(
        "activeFeaturesForConnectedUser",
        graphQLResolver({
          activeFeaturesForConnectedUser,
        }),
      ),
    ],
    appointmentDetailsWait,
  };
};
