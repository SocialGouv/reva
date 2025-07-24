import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";

const getCertificationAuthorityStructureCGUQuery = graphql(`
  query getCertificationAuthorityStructureCGUQuery {
    account_getAccountForConnectedUser {
      certificationRegistryManager {
        certificationAuthorityStructure {
          cguAcceptanceRequired
          cgu {
            isLatestVersion
          }
        }
      }
      certificationAuthority {
        certificationAuthorityStructures {
          cguAcceptanceRequired
          cgu {
            isLatestVersion
          }
        }
      }
      certificationAuthorityLocalAccount {
        certificationAuthority {
          certificationAuthorityStructures {
            cguAcceptanceRequired
            certificationRegistryManager {
              account {
                firstname
                lastname
              }
            }
            cgu {
              isLatestVersion
            }
          }
        }
      }
    }
  }
`);

export const useCertificateurLayout = () => {
  const {
    isAdmin,
    isAdminCertificationAuthority,
    isCertificationAuthority,
    isCertificationRegistryManager,
    isCertificationLocalAccount,
  } = useAuth();
  const { isFeatureActive } = useFeatureflipping();
  const isCguCertificateurActive = isFeatureActive("CGU_CERTIFICATEUR");

  const { graphqlClient } = useGraphQlClient();

  const {
    data: getCertificationAuthorityStructureCGU,
    isLoading: getCertificationAuthorityStructureCGURequestLoading,
  } = useQuery({
    queryKey: ["certificateur", "getCertificationAuthorityStructureCGU"],
    queryFn: () =>
      graphqlClient.request(getCertificationAuthorityStructureCGUQuery),
    enabled: isCguCertificateurActive,
  });

  const certificationAuthorityStructure =
    getCertificationAuthorityStructureCGU?.account_getAccountForConnectedUser
      ?.certificationAuthority?.certificationAuthorityStructures[0] ||
    getCertificationAuthorityStructureCGU?.account_getAccountForConnectedUser
      ?.certificationRegistryManager?.certificationAuthorityStructure ||
    getCertificationAuthorityStructureCGU?.account_getAccountForConnectedUser
      ?.certificationAuthorityLocalAccount?.certificationAuthority
      ?.certificationAuthorityStructures[0];

  const certificationAuthorityStructureCGU =
    certificationAuthorityStructure?.cgu;

  const cguAcceptanceRequired =
    certificationAuthorityStructure?.cguAcceptanceRequired;

  const currentPathName = usePathname();

  const isOnCguPage =
    currentPathName === "/certificateur-cgu/" ||
    currentPathName === "/certificateur-cgu";

  const displayCguCertificateur =
    isCguCertificateurActive &&
    !isAdmin &&
    cguAcceptanceRequired &&
    !certificationAuthorityStructureCGU?.isLatestVersion &&
    !isOnCguPage &&
    (isAdminCertificationAuthority ||
      isCertificationAuthority ||
      isCertificationRegistryManager ||
      isCertificationLocalAccount);

  return {
    displayCguCertificateur,
    getCertificationAuthorityStructureCGURequestLoading,
  };
};
