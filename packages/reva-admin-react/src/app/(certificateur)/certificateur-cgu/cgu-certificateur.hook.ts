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
  } = useAuth();
  const { isFeatureActive } = useFeatureflipping();
  const isCguCertificateurActive = isFeatureActive("CGU_CERTIFICATEUR");

  const { data: getCertificationAuthorityStructureCGU } = useQuery({
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
    isCertificationRegistryManager;

  const cguStructure =
    getCertificationAuthorityStructureCGU?.account_getAccountForConnectedUser
      ?.certificationRegistryManager?.certificationAuthorityStructure?.cgu ||
    getCertificationAuthorityStructureCGU?.account_getAccountForConnectedUser
      ?.certificationAuthority?.certificationAuthorityStructures?.[0]?.cgu;

  const canAccessCguCertificateur =
    isCertificateur &&
    isCguCertificateurActive &&
    !cguStructure?.isLatestVersion;

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
    cguCertificateur,
    canAccessCguCertificateur,
  };
};
