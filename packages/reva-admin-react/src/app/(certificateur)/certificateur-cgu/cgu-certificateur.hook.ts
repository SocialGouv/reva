import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphql } from "@/graphql/generated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import request from "graphql-request";

const acceptCertificateurCGUMutation = graphql(`
  mutation acceptCertificateurCGUMutation {
    certification_authority_acceptCgu
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

const getCertificationAuthorityStructureCGUInCguPageQuery = graphql(`
  query getCertificationAuthorityStructureCGUInCguPageQuery {
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
          certificationRegistryManager {
            account {
              firstname
              lastname
            }
          }
          cguAcceptanceRequired
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

export const useCguCertificateur = () => {
  const { graphqlClient } = useGraphQlClient();
  const queryClient = useQueryClient();
  const {
    isCertificationRegistryManager,
    isAdminCertificationAuthority,
    isCertificationAuthority,
    isCertificationLocalAccount,
  } = useAuth();
  const { isFeatureActive } = useFeatureflipping();
  const isCguCertificateurActive = isFeatureActive("CGU_CERTIFICATEUR");

  const {
    data: getCertificationAuthorityStructureCGU,
    isLoading: isLoadingGetCertificationAuthorityStructureCGU,
  } = useQuery({
    queryKey: ["certificateur", "getCertificationAuthorityStructureCGU"],
    queryFn: () =>
      graphqlClient.request(
        getCertificationAuthorityStructureCGUInCguPageQuery,
      ),
    enabled: isCguCertificateurActive,
  });

  const isCertificateur =
    isAdminCertificationAuthority ||
    isCertificationAuthority ||
    isCertificationRegistryManager ||
    isCertificationLocalAccount;

  const certificationAuthorityStructure =
    getCertificationAuthorityStructureCGU?.account_getAccountForConnectedUser
      ?.certificationRegistryManager?.certificationAuthorityStructure ||
    getCertificationAuthorityStructureCGU?.account_getAccountForConnectedUser
      ?.certificationAuthority?.certificationAuthorityStructures?.[0] ||
    getCertificationAuthorityStructureCGU?.account_getAccountForConnectedUser
      ?.certificationAuthorityLocalAccount?.certificationAuthority
      ?.certificationAuthorityStructures?.[0];

  const cguStructure = certificationAuthorityStructure?.cgu;
  const cguAcceptanceRequired =
    certificationAuthorityStructure?.cguAcceptanceRequired;

  const canAccessCguCertificateur =
    isCertificateur &&
    isCguCertificateurActive &&
    !cguStructure?.isLatestVersion;

  const certificationAuthorityManagerFirstname =
    (
      certificationAuthorityStructure as unknown as {
        certificationRegistryManager: {
          account: { firstname: string };
        };
      }
    )?.certificationRegistryManager?.account?.firstname ?? "";

  const certificationAuthorityManagerLastname =
    (
      certificationAuthorityStructure as unknown as {
        certificationRegistryManager: {
          account: { lastname: string };
        };
      }
    )?.certificationRegistryManager?.account?.lastname ?? "";

  const { mutateAsync: acceptCertificateurCgu } = useMutation({
    mutationFn: () => graphqlClient.request(acceptCertificateurCGUMutation),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["certificateur"],
      });
    },
  });

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

  return {
    acceptCertificateurCgu,
    isCertificationRegistryManager,
    isAdminCertificationAuthority,
    cguCertificateur,
    canAccessCguCertificateur,
    certificationAuthorityManagerFirstname,
    certificationAuthorityManagerLastname,
    isLoadingGetCertificationAuthorityStructureCGU,
    cguAcceptanceRequired,
  };
};
