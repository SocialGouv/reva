import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth/auth";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";

import { graphql } from "@/graphql/generated";

const getCertificationAuthorityStructureCGUQueryForCertificationRegistryManager =
  graphql(`
    query getCertificationAuthorityStructureCGUQueryForCertificationRegistryManager {
      account_getAccountForConnectedUser {
        certificationRegistryManager {
          certificationAuthorityStructure {
            cguAcceptanceRequired
            cgu {
              isLatestVersion
            }
          }
        }
      }
    }
  `);

const getCertificationAuthorityStructureCGUQueryForCertificationAuthority =
  graphql(`
    query getCertificationAuthorityStructureCGUQueryForCertificationAuthority {
      account_getAccountForConnectedUser {
        certificationAuthority {
          certificationAuthorityStructures {
            cguAcceptanceRequired
            cgu {
              isLatestVersion
            }
          }
        }
      }
    }
  `);

const getCertificationAuthorityStructureCGUQueryForCertificationAuthorityLocalAccount =
  graphql(`
    query getCertificationAuthorityStructureCGUQueryForCertificationAuthorityLocalAccount {
      account_getAccountForConnectedUser {
        certificationAuthorityLocalAccount {
          certificationAuthority {
            certificationAuthorityStructures {
              cguAcceptanceRequired
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

  const { graphqlClient } = useGraphQlClient();

  const shouldFetchCertificationAuthority =
    isAdminCertificationAuthority ||
    (isCertificationAuthority && !isCertificationLocalAccount);
  const shouldFetchCertificationRegistryManager =
    !isAdmin && isCertificationRegistryManager;
  const shouldFetchCertificationAuthorityLocalAccount =
    !isAdmin && isCertificationLocalAccount;

  const {
    data: certificationAuthorityCguData,
    isLoading: certificationAuthorityCguLoading,
  } = useQuery({
    queryKey: [
      "certificateur",
      "getCertificationAuthorityStructureCGU",
      "certificationAuthority",
    ],
    queryFn: () =>
      graphqlClient.request(
        getCertificationAuthorityStructureCGUQueryForCertificationAuthority,
      ),
    enabled: shouldFetchCertificationAuthority,
  });

  const {
    data: certificationRegistryManagerCguData,
    isLoading: certificationRegistryManagerCguLoading,
  } = useQuery({
    queryKey: [
      "certificateur",
      "getCertificationAuthorityStructureCGU",
      "certificationRegistryManager",
    ],
    queryFn: () =>
      graphqlClient.request(
        getCertificationAuthorityStructureCGUQueryForCertificationRegistryManager,
      ),
    enabled: shouldFetchCertificationRegistryManager,
  });

  const {
    data: certificationAuthorityLocalAccountCguData,
    isLoading: certificationAuthorityLocalAccountCguLoading,
  } = useQuery({
    queryKey: [
      "certificateur",
      "getCertificationAuthorityStructureCGU",
      "certificationAuthorityLocalAccount",
    ],
    queryFn: () =>
      graphqlClient.request(
        getCertificationAuthorityStructureCGUQueryForCertificationAuthorityLocalAccount,
      ),
    enabled: shouldFetchCertificationAuthorityLocalAccount,
  });

  const certificationAuthorityStructure =
    certificationAuthorityCguData?.account_getAccountForConnectedUser
      ?.certificationAuthority?.certificationAuthorityStructures[0] ??
    certificationRegistryManagerCguData?.account_getAccountForConnectedUser
      ?.certificationRegistryManager?.certificationAuthorityStructure ??
    certificationAuthorityLocalAccountCguData
      ?.account_getAccountForConnectedUser?.certificationAuthorityLocalAccount
      ?.certificationAuthority?.certificationAuthorityStructures[0] ??
    null;

  const certificationAuthorityStructureCGU =
    certificationAuthorityStructure?.cgu;

  const cguAcceptanceRequired =
    certificationAuthorityStructure?.cguAcceptanceRequired;

  const currentPathName = usePathname();

  const isOnCguPage =
    currentPathName === "/certificateur-cgu/" ||
    currentPathName === "/certificateur-cgu";

  const displayCguCertificateur =
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
    getCertificationAuthorityStructureCGURequestLoading:
      certificationAuthorityCguLoading ||
      certificationRegistryManagerCguLoading ||
      certificationAuthorityLocalAccountCguLoading,
  };
};
