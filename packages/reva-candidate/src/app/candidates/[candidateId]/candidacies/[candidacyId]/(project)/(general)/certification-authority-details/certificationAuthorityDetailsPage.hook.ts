import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCandidacyByIdForCertificationAuthorityDetailsPage = graphql(`
  query getCandidacyByIdForCertificationAuthorityDetailsPage(
    $candidacyId: ID!
  ) {
    getCandidacyById(id: $candidacyId) {
      certification {
        id
        codeRncp
        label
      }
      certificationAuthority {
        label
        contactEmail
        contactPhone
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

export const useCertificationAuthorityDetailsPage = () => {
  const { graphqlClient } = useGraphQlClient();
  const { isFeatureActive } = useFeatureFlipping();
  const isNewCertificationAuthorityCardFeatureActive = isFeatureActive(
    "NEW_CANDIDACY_CERTIFICATION_AUTHORITY_CARD",
  );

  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { data } = useSuspenseQuery({
    queryKey: ["candidacy", "certification-authority-details", candidacyId],
    queryFn: () =>
      graphqlClient.request(
        getCandidacyByIdForCertificationAuthorityDetailsPage,
        {
          candidacyId,
        },
      ),
  });

  const candidacy = data?.getCandidacyById;

  const certification = candidacy?.certification;

  const certificationAuthority = isNewCertificationAuthorityCardFeatureActive
    ? candidacy?.certificationAuthority
    : candidacy?.feasibility?.certificationAuthority;

  const certificationAuthorityLocalAccounts =
    candidacy?.certificationAuthorityLocalAccounts;

  return {
    candidacy,
    certification,
    certificationAuthority,
    certificationAuthorityLocalAccounts,
  };
};
