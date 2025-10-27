import { graphql, Page } from "next/experimental/testmode/playwright/msw";

import { graphQLResolver } from "@tests/helpers/network/msw";
import { waitGraphQL } from "@tests/helpers/network/requests";

import { Appointment, Candidacy } from "@/graphql/generated/graphql";

export async function navigateToAppointmentDetailsPage(
  page: Page,
  candidateId: string,
  candidacyId: string,
  appointmentId: string,
) {
  await page.goto(
    `candidates/${candidateId}/candidacies/${candidacyId}/appointments/${appointmentId}/`,
  );
}

interface AppointmentDetailsHandlersOptions {
  candidacy: Partial<Candidacy>;
  appointment: Partial<Appointment>;
  activeFeaturesForConnectedUser?: string[];
}

const appointmentDetailsWait = async (page: Page) => {
  await Promise.all([
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getOrganism"),
    waitGraphQL(page, "getAppointmentDetails"),
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
