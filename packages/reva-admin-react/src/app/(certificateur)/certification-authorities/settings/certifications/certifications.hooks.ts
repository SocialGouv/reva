import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityAndCertificationsQuery = graphql(`
  query getCertificationAuthorityForCertificationsPage {
    account_getAccountForConnectedUser {
      certificationAuthority {
        id
        label
        certificationAuthorityStructures {
          id
          label
          certifications {
            id
            codeRncp
            label
          }
        }
        certifications {
          id
          codeRncp
          label
        }
      }
    }
  }
`);

export const useCertificationsPage = () => {
  const { graphqlClient } = useGraphQlClient();

  const { data: getCertificationAuthorityAndCertificationsResponse } =
    useSuspenseQuery({
      queryKey: ["getCertificationAuthorityWithCertifications"],
      queryFn: () =>
        graphqlClient.request(getCertificationAuthorityAndCertificationsQuery),
    });

  const certificationAuthority =
    getCertificationAuthorityAndCertificationsResponse
      ?.account_getAccountForConnectedUser?.certificationAuthority;

  const certifications = useMemo(() => {
    const certificationAuthorityCertificationIds = new Set<string>();

    for (const certification of certificationAuthority?.certifications || []) {
      certificationAuthorityCertificationIds.add(certification.id);
    }

    return certificationAuthority?.certificationAuthorityStructures
      ?.flatMap(
        (certificationAuthorityStructure) =>
          certificationAuthorityStructure.certifications,
      )
      .map((certification) => ({
        id: certification.id,
        label: `${certification.codeRncp} - ${certification.label}`,
        selected: certificationAuthorityCertificationIds.has(certification.id),
      }));
  }, [
    certificationAuthority?.certifications,
    certificationAuthority?.certificationAuthorityStructures,
  ]);

  return {
    certificationAuthority,
    certifications,
  };
};
