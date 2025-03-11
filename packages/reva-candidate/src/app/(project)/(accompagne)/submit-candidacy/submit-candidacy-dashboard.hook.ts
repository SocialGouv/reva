import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useSuspenseQuery } from "@tanstack/react-query";

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
        certification {
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
  return {
    candidate,
    candidacy,
    certification,
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
