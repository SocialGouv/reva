import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidateTypology } from "@/graphql/generated/graphql";

const getCandidacyById = graphql(`
  query getCandidacyForCandidacyTypologyPage($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      typology
      conventionCollective {
        id
        idcc
        label
      }
    }
  }
`);

const submitTypologyFormMutation = graphql(`
  mutation submitTypologyFormForCandidacyTypologyPage(
    $candidacyId: ID!
    $ccnId: ID
    $typology: CandidateTypology!
  ) {
    candidacy_submitTypologyForm(
      candidacyId: $candidacyId
      ccnId: $ccnId
      typology: $typology
    ) {
      id
      typology
      conventionCollective {
        id
        idcc
        label
      }
    }
  }
`);

export const useTypologyPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyByIdData } = useQuery({
    queryKey: [candidacyId, "getCandidacyForCandidateTyplogyPage"],
    queryFn: () =>
      graphqlClient.request(getCandidacyById, {
        candidacyId,
      }),
  });

  const submitTypologyForm = useMutation({
    mutationFn: ({
      ccnId,
      typology,
    }: {
      ccnId?: string;
      typology: CandidateTypology;
    }) =>
      graphqlClient.request(submitTypologyFormMutation, {
        candidacyId,
        ccnId,
        typology,
      }),
  });

  const candidacy = getCandidacyByIdData?.getCandidacyById;

  return { candidacy, submitTypologyForm };
};
