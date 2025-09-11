import { useSuspenseQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanSubmitCandidacyToAap } from "@/utils/candidateCanSubmitCandidacyToAap.util";

import { graphql } from "@/graphql/generated";

const GET_CANDIDATE_WITH_CANDIDACY = graphql(`
  query candidate_getCandidateWithCandidacyForCandidacySubmitDashboard {
    candidate_getCandidateWithCandidacy {
      firstname
      lastname
      email
      gender
      firstname2
      firstname3
      givenName
      birthdate
      birthCity
      birthDepartment {
        code
      }
      nationality
      phone
      street
      zip
      city
      candidacy {
        id
        status
        certification {
          id
          label
          codeRncp
          isAapAvailable
        }
        experiences {
          id
          title
          startedAt
          description
          duration
        }
        goals {
          id
          label
        }
        organism {
          id
          label
          contactAdministrativeEmail
          contactAdministrativePhone
          nomPublic
          emailContact
          telephone
          adresseNumeroEtNomDeRue
          adresseInformationsComplementaires
          adresseCodePostal
          adresseVille
        }
      }
    }
  }
`);

export const useSubmitCandidacyForDashboard = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data } = useSuspenseQuery({
    queryKey: ["candidate", "submit-candidacy"],
    queryFn: () => graphqlClient.request(GET_CANDIDATE_WITH_CANDIDACY),
  });

  const candidate = data?.candidate_getCandidateWithCandidacy;
  const candidacy = candidate?.candidacy;
  const certification = candidate?.candidacy?.certification;

  const hasSelectedCertification = !!candidacy?.certification?.id;

  const hasCompletedGoals = !!candidacy?.goals?.length;

  const hasCompletedExperience = candidacy?.experiences?.length > 0;

  const hasSelectedOrganism = !!candidacy?.organism?.id;

  const candidacyAlreadySubmitted = candidacy?.status !== "PROJET";

  const canSubmitCandidacy = candidateCanSubmitCandidacyToAap({
    hasSelectedCertification,
    hasCompletedGoals,
    hasSelectedOrganism,
    hasCompletedExperience,
    candidacyAlreadySubmitted,
  });

  return {
    candidate,
    candidacy,
    certification,
    canSubmitCandidacy,
    candidacyAlreadySubmitted,
  };
};

type SubmitCandidacyForDashboardHookReturnType = ReturnType<
  typeof useSubmitCandidacyForDashboard
>;
export type CandidateUseSubmitCandidacyForDashboard =
  SubmitCandidacyForDashboardHookReturnType["candidate"];

export type ExperiencesUseSubmitCandidacyForDashboard =
  SubmitCandidacyForDashboardHookReturnType["candidacy"]["experiences"];

export type GoalsUseSubmitCandidacyForDashboard =
  SubmitCandidacyForDashboardHookReturnType["candidacy"]["goals"];

export type OrganismUseSubmitCandidacyForDashboard =
  SubmitCandidacyForDashboardHookReturnType["candidacy"]["organism"];
