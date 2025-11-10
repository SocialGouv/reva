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
    const structureIds = new Set<string>();

    for (const cas of certificationAuthority?.certificationAuthorityStructures ||
      []) {
      for (const c of cas.certifications) {
        structureIds.add(c.id);
      }
    }

    return certificationAuthority?.certifications?.map((c) => ({
      id: c.id,
      label: `${c.codeRncp} - ${c.label}`,
      selected: structureIds.has(c.id),
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
