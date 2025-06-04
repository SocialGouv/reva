import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";

const getCandidacyById = graphql(`
  query getCandidacySummaryById($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      financeModule
      typeAccompagnement
      certificationAuthorityLocalAccounts {
        contactFullName
        contactEmail
        contactPhone
      }
      candidacyDropOut {
        createdAt
        proofReceivedByAdmin
      }
      reorientationReason {
        id
      }
      organism {
        label
        contactAdministrativeEmail
        emailContact
        nomPublic
        maisonMereAAP {
          id
        }
      }
      status
      certification {
        id
        codeRncp
        label
        isAapAvailable
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
          label
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
      feasibilityFormat
      feasibility {
        certificationAuthority {
          label
          contactFullName
          contactEmail
          contactPhone
        }
        feasibilityFileSentAt
        decision
      }
    }
  }
`);

const useCandidateSummary = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCandidacyByIdData, isLoading: getCandidacyIsLoading } =
    useQuery({
      queryKey: [candidacyId, "getCandidacySummaryById"],
      queryFn: () =>
        graphqlClient.request(getCandidacyById, {
          candidacyId,
        }),
    });

  const candidacy = getCandidacyByIdData?.getCandidacyById;

  return {
    candidacy,
    getCandidacyIsLoading,
  };
};

export default useCandidateSummary;
