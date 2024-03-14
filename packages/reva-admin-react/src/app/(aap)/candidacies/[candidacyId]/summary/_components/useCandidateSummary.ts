import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCandidacyById = graphql(`
  query getCandidacyById($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      certification {
        label
      }
      candidate {
        firstname
        firstname2
        firstname3
        givenName
        gender
        lastname
        phone
        email
        birthdate
        birthCity
        birthDepartment {
          label
          code
        }
        country {
          id
          label
        }
        nationality
        socialSecurityNumber
        department {
          label
          code
        }
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

const useCandidateSummary = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyByIdData, isLoading: getCandidacyIsLoading } =
    useQuery({
      queryKey: ["getCandidacyById", candidacyId],
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

  const candidacy = getCandidacyByIdData?.getCandidacyById;
  const countries = getCountriesData?.getCountries;

  return { candidacy, getCandidacyIsLoading, countries, getCountriesIsLoading };
};

export default useCandidateSummary;
