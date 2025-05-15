import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

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
            isLatestVersion
          }
        }
      }
      certificationAuthorityLocalAccount {
        certificationAuthority {
          certificationAuthorityStructures {
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
      ?.certificationRegistryManager?.certificationAuthorityStructure?.cgu ||
    getCertificationAuthorityStructureCGU?.account_getAccountForConnectedUser
      ?.certificationAuthorityLocalAccount?.certificationAuthority
      ?.certificationAuthorityStructures[0]?.cgu;

  const currentPathName = usePathname();

  const isOnCguPage =
    currentPathName === "/certificateur-cgu/" ||
    currentPathName === "/certificateur-cgu";

  const displayCguCertificateur =
    isCguCertificateurActive &&
    !isAdmin &&
    !certificationAuthorityStructureCGU?.isLatestVersion &&
    !isOnCguPage &&
    (isAdminCertificationAuthority ||
      isCertificationAuthority ||
      isCertificationRegistryManager ||
      isCertificationLocalAccount);

  return {
    displayCguCertificateur,
  };
};
