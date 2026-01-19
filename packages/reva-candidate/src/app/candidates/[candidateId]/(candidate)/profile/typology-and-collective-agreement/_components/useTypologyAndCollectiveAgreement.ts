import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CandidateUpdateTypologyAndCcnInput } from "@/graphql/generated/graphql";

const getCandidateByIdForTypologyAndCollectiveAgreementPage = graphql(`
  query getCandidateByIdForTypologyAndCollectiveAgreementPage(
    $candidateId: ID!
  ) {
    candidate_getCandidateById(id: $candidateId) {
      id
      firstname
      lastname
      givenName
      firstname2
      firstname3
      gender
      birthCity
      birthdate
      birthDepartment {
        id
      }
      country {
        id
      }
      nationality
      street
      city
      zip
      phone
      email
      addressComplement
      conventionCollective {
        id
        idcc
        label
      }
      typology
      typologyAdditional
    }
  }
`);

export const useTypologyAndCollectiveAgreement = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidateId } = useParams<{
    candidateId: string;
  }>();

  const { data: getCandidateData } = useQuery({
    queryKey: [
      "candidate",
      "getCandidateByIdForTypologyAndCollectiveAgreementPage",
      candidateId,
    ],
    queryFn: () =>
      graphqlClient.request(
        getCandidateByIdForTypologyAndCollectiveAgreementPage,
        {
          candidateId,
        },
      ),
  });

  const candidate = getCandidateData?.candidate_getCandidateById;

  return {
    candidate,
  };
};

const updateCandidateTypologyAndCcnMutation = graphql(`
  mutation updateCandidateTypologyAndCcnMutation(
    $candidateId: String!
    $candidateTypologyAndCcn: CandidateUpdateTypologyAndCcnInput!
  ) {
    candidate_updateCandidateTypologyAndCcn(
      candidateId: $candidateId
      candidateTypologyAndCcn: $candidateTypologyAndCcn
    ) {
      id
    }
  }
`);

export const useUpdateCandidateTypologyAndCcn = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateCandidateTypologyAndCcnMutate,
    isPending: updateCandidateTypologyAndCcnIsPending,
  } = useMutation({
    mutationKey: ["updateCandidateTypologyAndCcn"],
    mutationFn: ({
      candidateId,
      candidateTypologyAndCcn,
    }: {
      candidateId: string;
      candidateTypologyAndCcn: CandidateUpdateTypologyAndCcnInput;
    }) =>
      graphqlClient.request(updateCandidateTypologyAndCcnMutation, {
        candidateId,
        candidateTypologyAndCcn,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidate"] });
    },
  });

  return {
    updateCandidateTypologyAndCcnMutate,
    updateCandidateTypologyAndCcnIsPending,
  };
};

type ProfileHookReturnType = ReturnType<
  typeof useTypologyAndCollectiveAgreement
>;
export type CandidateUseProfile = ProfileHookReturnType["candidate"];
