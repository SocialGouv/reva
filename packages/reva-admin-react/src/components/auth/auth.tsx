import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";
import { Session } from "next-auth";

export const useAuth = () => {
  const { data: session } = useSession();
  const accessToken = (session as Session & { accessToken: string })
    ?.accessToken;

  let isAdmin,
    isCertificationAuthority,
    isOrganism,
    isGestionnaireMaisonMereAAP = false;

  if (accessToken) {
    const decodedToken = jwtDecode<{
      resource_access: { "reva-admin": { roles: string[] } };
    }>(accessToken);

    const roles = decodedToken.resource_access["reva-admin"].roles;
    isAdmin = roles.includes("admin");
    isCertificationAuthority = roles.includes("manage_feasibility");
    isOrganism = roles.includes("manage_candidacy");
    isGestionnaireMaisonMereAAP = roles.includes("gestion_maison_mere_aap");
  }
  return {
    isAdmin,
    isCertificationAuthority,
    isOrganism,
    isGestionnaireMaisonMereAAP,
  };
};
