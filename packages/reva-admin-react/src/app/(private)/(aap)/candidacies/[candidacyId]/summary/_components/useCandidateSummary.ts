import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { canAAPEditExperiences } from "@/utils/canAAPEditExperiences";

import { graphql } from "@/graphql/generated";

const getCandidacyById = graphql(`
  query getCandidacySummaryById($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      financeModule
      typeAccompagnement
      endAccompagnementStatus
      endAccompagnementDate
      certificationAuthorities {
        id
      }
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
      }
      candidateInfo {
        street
        city
        zip
        addressComplement
      }
      candidate {
        id
        firstname
        firstname2
        firstname3
        middleNames
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
          level
        }
        highestDegreeLabel
        niveauDeFormationLePlusEleve {
          id
          level
        }
        civilInformationCompleted
        contactInformationCompleted
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
          id
          label
          contactFullName
          contactEmail
          contactPhone
        }
        feasibilityFileSentAt
        decision
      }
      certificationAuthority {
        id
        label
      }
    }
  }
`);

const getCandidacyFeasibilityCertificationAuthorityStructures = graphql(`
  query getCandidacyFeasibilityCertificationAuthorityStructures(
    $candidacyId: ID!
  ) {
    getCandidacyById(id: $candidacyId) {
      feasibility {
        certificationAuthority {
          certificationAuthorityStructures {
            id
            label
          }
        }
      }
    }
  }
`);

const useCandidateSummary = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();
  const { isAdmin } = useAuth();

  const { data: getCandidacyByIdData, isLoading: getCandidacyIsLoading } =
    useQuery({
      queryKey: [candidacyId, "getCandidacySummaryById"],
      queryFn: () =>
        graphqlClient.request(getCandidacyById, {
          candidacyId,
        }),
    });

  //Separate query for the certification authority structure since execution it with an aap profile would cause an error
  const {
    data: getCandidacyFeasibilityCertificationAuthorityStructuresData,
    isLoading: getCandidacyFeasibilityCertificationAuthorityStructuresIsLoading,
  } = useQuery({
    queryKey: [
      candidacyId,
      "getCandidacyFeasibilityCertificationAuthorityStructures",
    ],
    queryFn: () =>
      graphqlClient.request(
        getCandidacyFeasibilityCertificationAuthorityStructures,
        {
          candidacyId,
        },
      ),
    enabled: isAdmin,
  });

  const candidacy = getCandidacyByIdData?.getCandidacyById;

  const certificationAuthorityStructure =
    getCandidacyFeasibilityCertificationAuthorityStructuresData
      ?.getCandidacyById?.feasibility?.certificationAuthority
      ?.certificationAuthorityStructures[0];

  const canEditExperiences = canAAPEditExperiences(candidacy?.status);

  return {
    candidacy,
    getCandidacyIsLoading,
    certificationAuthorityStructure,
    getCandidacyFeasibilityCertificationAuthorityStructuresIsLoading,
    canEditExperiences,
  };
};

export default useCandidateSummary;
