import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { CandidateUpdateInformationInput } from "@/graphql/generated/graphql";
import { useMutation, useQuery } from "@tanstack/react-query";

const getCandidacyById = graphql(`
  query getCandidacyById($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidacyDropOut {
        droppedOutAt
      }
      reorientationReason {
        id
      }
      organismId
      candidacyStatuses {
        status
        isActive
      }
      certification {
        codeRncp
        label
      }
      admissibilityFvae {
        isAlreadyAdmissible
        expiresAt
      }
      candidate {
        id
        firstname
        firstname2
        firstname3
        givenName
        gender
        lastname
        phone
        email
        street
        city
        zip
        birthdate
        birthCity
        birthDepartment {
          id
          label
          code
        }
        country {
          id
          label
        }
        nationality
        department {
          id
          label
          code
        }
        highestDegree {
          id
        }
        highestDegreeLabel
        niveauDeFormationLePlusEleve {
          id
          label
        }
      }
      experiences {
        id
        title
        startedAt
        duration
        description
      }
      goals {
        id
        label
      }
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

export const useCandidateSummary = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyByIdData, isLoading: getCandidacyIsLoading, error: getCandidacyError } =
    useQuery({
      queryKey: [candidacyId, "getCandidacyById"],
      queryFn: () =>
        graphqlClient.request(getCandidacyById, {
          candidacyId,
        }),
    });

  const { data: getCountriesData, isLoading: getCountriesIsLoading, error: getCountriesError } = useQuery(
    {
      queryKey: ["getCountries"],
      queryFn: () => graphqlClient.request(getCountries),
    },
  );

  const { data: getDepartmentsData, isLoading: getDepartmentsIsLoading, error: getDepartmentsError } = useQuery({
    queryKey: ["getDepartments"],
    queryFn: () => graphqlClient.request(getDepartments),
  });

  const candidacy = getCandidacyByIdData?.getCandidacyById;
  const countries = getCountriesData?.getCountries;
  const departments = getDepartmentsData?.getDepartments;

  return {
    candidacy,
    getCandidacyIsLoading,
    getCandidacyError,
    countries,
    getCountriesIsLoading,
    getCountriesError,
    departments,
    getDepartmentsIsLoading,
    getDepartmentsError,
  };
};

const updateCandidateInformationMutation = graphql(`
  mutation updateCandidateInformationMutation(
    $candidacyId: String!
    $candidateInformation: CandidateUpdateInformationInput!
  ) {
    candidate_updateCandidateInformation(
      candidacyId: $candidacyId
      candidateInformation: $candidateInformation
    ) {
      id
    }
  }
`);

export const useUpdateCandidateInformation = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();

  const {
    mutateAsync: updateCandidateInformationMutate,
    isPending: updateCandidateInformationIsPending,
  } = useMutation({
    mutationKey: ["updateCandidateInformation", candidacyId],
    mutationFn: ({
      candidateInformation,
    }: {
      candidateInformation: CandidateUpdateInformationInput;
    }) =>
      graphqlClient.request(updateCandidateInformationMutation, {
        candidacyId,
        candidateInformation,
      }),
  });

  return {
    updateCandidateInformationMutate,
    updateCandidateInformationIsPending,
  };
};

export type Candidacy = ReturnType<typeof  useCandidateSummary>["candidacy"];
export type Countries = ReturnType<typeof useCandidateSummary>["countries"];
export type Departments = ReturnType<typeof useCandidateSummary>["departments"];
