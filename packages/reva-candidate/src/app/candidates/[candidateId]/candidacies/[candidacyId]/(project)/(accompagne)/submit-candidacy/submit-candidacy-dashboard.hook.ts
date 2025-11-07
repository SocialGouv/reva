import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanSubmitCandidacyToAap } from "@/utils/candidateCanSubmitCandidacyToAap.util";

import { graphql } from "@/graphql/generated";

const GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_CANDIDACY_SUBMIT_DASHBOARD =
  graphql(`
    query getCandidacyByIdWithCandidateForCandidacySubmitDashboard(
      $candidacyId: ID!
    ) {
      getCandidacyById(id: $candidacyId) {
        id
        status
        candidate {
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
        }
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
  `);

export const useSubmitCandidacyForDashboard = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data } = useSuspenseQuery({
    queryKey: ["candidacy", "submit-candidacy", candidacyId],
    queryFn: () =>
      graphqlClient.request(
        GET_CANDIDACY_BY_ID_WITH_CANDIDATE_FOR_CANDIDACY_SUBMIT_DASHBOARD,
        {
          candidacyId,
        },
      ),
  });

  const candidacy = data?.getCandidacyById;

  const candidate = candidacy?.candidate;
  const certification = candidacy?.certification;

  const hasSelectedCertification = !!candidacy?.certification?.id;

  const hasCompletedGoals = !!candidacy?.goals?.length;

  const hasCompletedExperience =
    (candidacy?.experiences && candidacy.experiences.length > 0) || false;

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

export type CandidateUseSubmitCandidacyForDashboard = NonNullable<
  SubmitCandidacyForDashboardHookReturnType["candidate"]
>;

type CandidacyUseSubmitCandidacyForDashboard = NonNullable<
  SubmitCandidacyForDashboardHookReturnType["candidacy"]
>;

export type ExperiencesUseSubmitCandidacyForDashboard =
  CandidacyUseSubmitCandidacyForDashboard["experiences"];

export type GoalsUseSubmitCandidacyForDashboard =
  CandidacyUseSubmitCandidacyForDashboard["goals"];

export type OrganismUseSubmitCandidacyForDashboard =
  CandidacyUseSubmitCandidacyForDashboard["organism"];
