import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { CandidateUpdateInformationBySelfInput } from "@/graphql/generated/graphql";

const getCandidateForProfilePage = graphql(`
  query getCandidateForProfilePage {
    candidate_getCandidateWithCandidacy {
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
    }
  }
`);

const getCountries = graphql(`
  query getCountries {
    getCountries {
      id
      label
    }
  }
`);

const getDepartments = graphql(`
  query getDepartments {
    getDepartments {
      id
      label
      code
    }
  }
`);

export const useProfile = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidateData } = useQuery({
    queryKey: ["candidacy", "getCandidateForProfilePage"],
    queryFn: () => graphqlClient.request(getCandidateForProfilePage),
  });

  const { data: getCountriesData } = useQuery({
    queryKey: ["getCountries"],
    queryFn: () => graphqlClient.request(getCountries),
  });

  const { data: getDepartmentsData } = useQuery({
    queryKey: ["getDepartments"],
    queryFn: () => graphqlClient.request(getDepartments),
  });

  const candidate = getCandidateData?.candidate_getCandidateWithCandidacy;
  const countries = getCountriesData?.getCountries;
  const departments = getDepartmentsData?.getDepartments;

  const candidacyAlreadySubmitted = false; //candidacy?.status !== "PROJET";

  return {
    candidate,
    countries,
    departments,
    candidacyAlreadySubmitted,
  };
};

const updateCandidateInformationMutation = graphql(`
  mutation updateCandidateInformationMutation(
    $candidateId: String!
    $candidateInformation: CandidateUpdateInformationBySelfInput!
  ) {
    candidate_updateCandidateInformationBySelf(
      candidateId: $candidateId
      candidateInformation: $candidateInformation
    ) {
      id
    }
  }
`);

export const useUpdateCandidateInformation = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateCandidateInformationMutate,
    isPending: updateCandidateInformationIsPending,
  } = useMutation({
    mutationKey: ["updateCandidateInformation"],
    mutationFn: ({
      candidateInformation,
    }: {
      candidateInformation: CandidateUpdateInformationBySelfInput;
    }) =>
      graphqlClient.request(updateCandidateInformationMutation, {
        candidateId: candidateInformation.id,
        candidateInformation,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidacy"] });
    },
  });

  return {
    updateCandidateInformationMutate,
    updateCandidateInformationIsPending,
  };
};

type ProfileHookReturnType = ReturnType<typeof useProfile>;
export type CandidateUseProfile = ProfileHookReturnType["candidate"];
export type Countries = ProfileHookReturnType["countries"];
export type Departments = ProfileHookReturnType["departments"];
