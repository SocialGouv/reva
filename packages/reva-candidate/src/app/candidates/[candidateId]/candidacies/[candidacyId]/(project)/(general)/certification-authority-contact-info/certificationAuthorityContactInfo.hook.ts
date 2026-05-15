import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCandidacyByIdForCertificationAuthorityContactInfoPage = graphql(`
  query getCandidacyByIdForCertificationAuthorityContactInfoPage(
    $candidacyId: ID!
  ) {
    getCandidacyById(id: $candidacyId) {
      certification {
        id
        codeRncp
        label
      }
      certificationAuthorityLocalAccounts {
        contactFullName
        contactEmail
        contactPhone
      }
      feasibility {
        certificationAuthority {
          label
          contactEmail
          contactPhone
        }
      }
    }
  }
`);

export const useCertificationAuthorityContactInfoPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data } = useSuspenseQuery({
    queryKey: [
      "candidacy",
      "certification-authority-contact-info",
      candidacyId,
    ],
    queryFn: () =>
      graphqlClient.request(
        getCandidacyByIdForCertificationAuthorityContactInfoPage,
        {
          candidacyId,
        },
      ),
  });

  const candidacy = data?.getCandidacyById;

  const certification = candidacy?.certification;

  const certificationAuthority = candidacy?.feasibility?.certificationAuthority;

  const certificationAuthorityLocalAccounts =
    candidacy?.certificationAuthorityLocalAccounts;

  return {
    candidacy,
    certification,
    certificationAuthority,
    certificationAuthorityLocalAccounts,
  };
};
