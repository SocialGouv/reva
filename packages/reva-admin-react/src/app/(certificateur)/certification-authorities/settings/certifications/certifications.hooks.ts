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
    const selectedCertificationIds = new Set(
      certificationAuthority?.certifications?.map((c) => c.id) || [],
    );

    const certificationsMap = new Map<
      string,
      { id: string; label: string; selected: boolean }
    >();

    // On gère le cas où il y a plusieurs structures de certification
    // On ajoute les certifications de chaque structure à la map
    // On vérifie si la certification est déjà dans la map, si c'est le cas, on ne l'ajoute pas pour éviter les doublons
    certificationAuthority?.certificationAuthorityStructures
      ?.flatMap((structure) => structure.certifications)
      .forEach((certification) => {
        if (certificationsMap.has(certification.id)) {
          return;
        }

        certificationsMap.set(certification.id, {
          id: certification.id,
          label: `${certification.codeRncp} - ${certification.label}`,
          selected: selectedCertificationIds.has(certification.id),
        });
      });

    return Array.from(certificationsMap.values());
  }, [
    certificationAuthority?.certifications,
    certificationAuthority?.certificationAuthorityStructures,
  ]);
  return {
    certificationAuthority,
    certifications,
  };
};
