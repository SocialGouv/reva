import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

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

const useCandidateSummary = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyByIdData, isLoading: getCandidacyIsLoading } =
    useQuery({
      queryKey: [candidacyId, "getCandidacyById"],
      queryFn: () =>
        graphqlClient.request(getCandidacyById, {
          candidacyId,
        }),
    });

  const { data: getCountriesData, isLoading: getCountriesIsLoading } = useQuery(
    {
      queryKey: ["getCountries"],
      queryFn: () => graphqlClient.request(getCountries),
    },
  );

  const { data: getDepartmentsData } = useQuery({
    queryKey: ["getDepartments"],
    queryFn: () => graphqlClient.request(getDepartments),
  });

  const candidacy = getCandidacyByIdData?.getCandidacyById;
  const countries = getCountriesData?.getCountries;
  const departments = getDepartmentsData?.getDepartments;

  return {
    candidacy,
    getCandidacyIsLoading,
    countries,
    getCountriesIsLoading,
    departments,
  };
};

export default useCandidateSummary;
