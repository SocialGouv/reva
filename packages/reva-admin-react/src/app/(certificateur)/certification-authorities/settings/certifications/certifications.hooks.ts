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

  const certificationAuthorityStructuresCertifications = useMemo(() => {
    const certifications: {
      id: string;
      label: string;
      codeRncp: string;
    }[] = [];

    for (const cas of certificationAuthority?.certificationAuthorityStructures ||
      []) {
      for (const c of cas.certifications) {
        if (certifications.findIndex((cert) => cert.id === c.id) === -1) {
          certifications.push(c);
        }
      }
    }

    return certifications;
  }, [certificationAuthority?.certificationAuthorityStructures]);

  const certifications = useMemo(
    () =>
      certificationAuthorityStructuresCertifications.map((c) => ({
        id: c.id,
        label: `${c.codeRncp} - ${c.label}`,
        selected:
          certificationAuthority?.certifications.findIndex(
            (cert) => cert.id === c.id,
          ) != -1,
      })),
    [
      certificationAuthority?.certifications,
      certificationAuthorityStructuresCertifications,
    ],
  );

  return {
    certificationAuthority,
    certifications,
  };
};
