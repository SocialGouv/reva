import { jwtDecode } from "jwt-decode";

import { useKeycloakContext } from "@/components/auth/keycloakContext";

import { UserRole } from "./types";

export const useAuth = () => {
  const { accessToken } = useKeycloakContext();

  let isAdmin,
    isCertificationAuthority,
    isOrganism,
    isGestionnaireMaisonMereAAP,
    isAdminCertificationAuthority = false;

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
    isAdminCertificationAuthority = roles.includes(
      "manage_certification_authority_local_account",
    );
  }
  return {
    roles,
    isAdmin,
    isCertificationAuthority,
    isOrganism,
    isGestionnaireMaisonMereAAP,
    isAdminCertificationAuthority,
  };
};
