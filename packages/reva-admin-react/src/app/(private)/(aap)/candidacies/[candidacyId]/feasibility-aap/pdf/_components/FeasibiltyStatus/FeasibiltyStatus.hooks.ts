import { useQuery } from "@tanstack/react-query";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCandidacyQuery = graphql(`
  query getCandidacyForFeasibilityStatus($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      candidate {
        id
        firstname
        lastname
        department {
          id
        }
      }
      organism {
        contactAdministrativePhone
        contactAdministrativeEmail
        adresseVille
        adresseCodePostal
        adresseInformationsComplementaires
        adresseNumeroEtNomDeRue
        emailContact
        telephone
        nomPublic
        label
      }
      certificationAuthorityLocalAccounts {
        contactFullName
        contactEmail
        contactPhone
      }
      certification {
        id
        label
        codeRncp
        typeDiplome
      }
      feasibility {
        id
        decision
        decisionSentAt
        decisionComment
        certificationAuthority {
          id
          label
          contactFullName
          contactEmail
          contactPhone
        }
        feasibilityUploadedPdf {
          feasibilityFile {
            name
            url
          }
          IDFile {
            name
            url
          }
          documentaryProofFile {
            name
            url
          }
          certificateOfAttendanceFile {
            name
            url
          }
        }
        history {
          id
          decision
          decisionSentAt
          decisionComment
        }
      }
    }
  }
`);

export const useHooks = (candidacyId: string) => {
  const { graphqlClient } = useGraphQlClient();

  const candidacy = useQuery({
    queryKey: [candidacyId, "getCandidacyForFeasibilityStatus"],
    queryFn: () =>
      graphqlClient.request(getCandidacyQuery, {
        candidacyId,
      }),
  });

  return { candidacy };
};
