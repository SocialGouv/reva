import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import request from "graphql-request";

const getCertificationAuthorityStructureCGUQuery = graphql(`
  query getCertificationAuthorityStructureCGUQuery {
    account_getAccountForConnectedUser {
      certificationRegistryManager {
        certificationAuthorityStructure {
          cgu {
            isLatestVersion
          }
        }
      }
      certificationAuthority {
        certificationAuthorityStructures {
          cgu {
            version
            acceptedAt
            isLatestVersion
          }
        }
      }
    }
  }
`);

const getCguCertificateurQuery = graphql(`
  query getCguCertificateur {
    legals(filters: { nom: { eq: "CGU_CERTIFICATEUR" } }) {
      documentId
      titre
      contenu
      chapo
      dateDeMiseAJour
    }
  }
`);

export const useCertificateurLayout = () => {
  const {
    isAdmin,
    isAdminCertificationAuthority,
    isCertificationAuthority,
    isCertificationRegistryManager,
  } = useAuth();
  const { isFeatureActive } = useFeatureflipping();
  const isCguCertificateurActive = isFeatureActive("CGU_CERTIFICATEUR");

  const { graphqlClient } = useGraphQlClient();

  const { data: getCguCertificateurResponse } = useQuery({
    queryKey: ["strapi", "getCguCertificateur"],
    queryFn: () =>
      request(
        (process.env.NEXT_PUBLIC_WEBSITE_STRAPI_BASE_URL ?? "") + "/graphql",
        getCguCertificateurQuery,
      ),
    enabled: isCguCertificateurActive,
  });

  const cguCertificateur = getCguCertificateurResponse?.legals?.[0];

  const { data: getCertificationAuthorityStructureCGU } = useQuery({
    queryKey: ["certificateur", "getCertificationAuthorityStructureCGU"],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityStructureCGUQuery),
    enabled: isCguCertificateurActive,
  });

  const certificationAuthorityStructureCGU =
    getCertificationAuthorityStructureCGU?.account_getAccountForConnectedUser
      ?.certificationAuthority?.certificationAuthorityStructures[0]?.cgu ||
    getCertificationAuthorityStructureCGU?.account_getAccountForConnectedUser
      ?.certificationRegistryManager?.certificationAuthorityStructure?.cgu;

  const displayCguCertificateur =
    isCguCertificateurActive &&
    !isAdmin &&
    !certificationAuthorityStructureCGU?.isLatestVersion &&
    (isAdminCertificationAuthority ||
      isCertificationAuthority ||
      isCertificationRegistryManager);

  return {
    displayCguCertificateur,
    cguCertificateur,
  };
};

type CertificateurLayoutHookReturnType = ReturnType<
  typeof useCertificateurLayout
>;
export type CertificateurLayoutUseCguCertificateur =
  CertificateurLayoutHookReturnType["cguCertificateur"];
