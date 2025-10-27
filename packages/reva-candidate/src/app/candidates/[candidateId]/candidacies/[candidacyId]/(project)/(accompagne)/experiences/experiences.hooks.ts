import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { candidateCanEditCandidacy } from "@/utils/candidateCanEditCandidacy.util";

import { graphql } from "@/graphql/generated";
import { CandidacyStatusStep } from "@/graphql/generated/graphql";

const GET_CANDIDACY_BY_ID_FOR_EXPERIENCES_PAGE = graphql(`
  query getCandidacyByIdForExperiencesPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      candidacyDropOut {
        status
      }
      experiences {
        id
        title
        startedAt
        duration
        description
      }
    }
  }
`);

export const useExperiences = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data } = useQuery({
    queryKey: ["candidacy", "getCandidacyByIdForExperiencesPage"],
    queryFn: () =>
      graphqlClient.request(GET_CANDIDACY_BY_ID_FOR_EXPERIENCES_PAGE, {
        candidacyId,
      }),
  });

  const candidacy = data?.getCandidacyById;

  const canEditCandidacy = candidateCanEditCandidacy({
    candidacyStatus: candidacy?.status as CandidacyStatusStep,
    typeAccompagnement: "ACCOMPAGNE",
    candidacyDropOut: !!candidacy?.candidacyDropOut,
  });

  const candidacyAlreadySubmitted = candidacy?.status !== "PROJET";

  return {
    candidacy,
    canEditCandidacy,
    candidacyAlreadySubmitted,
  };
};
