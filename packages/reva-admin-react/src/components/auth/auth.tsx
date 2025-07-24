import { UserRole } from "./types";

import { jwtDecode } from "jwt-decode";

import { useKeycloakContext } from "@/components/auth/keycloakContext";

export const useAuth = () => {
  const { accessToken } = useKeycloakContext();

  let isAdmin: boolean = false,
    isCertificationAuthority: boolean = false,
    isOrganism: boolean = false,
    isGestionnaireMaisonMereAAP: boolean = false,
    isCertificationRegistryManager: boolean = false,
    isAdminCertificationAuthority: boolean = false,
    isCertificationLocalAccount: boolean = false;

  let roles: UserRole[] = [];

  if (accessToken) {
    const decodedToken = jwtDecode<{
      resource_access: { "reva-admin": { roles: string[] } };
    }>(accessToken);

    roles = decodedToken.resource_access["reva-admin"].roles as UserRole[];
    isAdmin = roles.includes("admin");
    isCertificationAuthority = roles.includes("manage_feasibility");
    isOrganism = roles.includes("manage_candidacy");
    isGestionnaireMaisonMereAAP = roles.includes("gestion_maison_mere_aap");
    isCertificationRegistryManager = roles.includes(
      "manage_certification_registry",
    );
    isAdminCertificationAuthority = roles.includes(
      "manage_certification_authority_local_account",
    );
    isCertificationLocalAccount =
      roles.includes("manage_feasibility") &&
      !roles.includes("manage_certification_authority_local_account");
  }
  return {
    roles,
    isAdmin,
    isCertificationAuthority,
    isOrganism,
    isGestionnaireMaisonMereAAP,
    isCertificationRegistryManager,
    isAdminCertificationAuthority,
    isCertificationLocalAccount,
  };
};
