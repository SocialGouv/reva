import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";
import { Session } from "next-auth";

export const useAuth = () => {
  const { data: session } = useSession();
  const accessToken = (session as Session & { accessToken: string })
    ?.accessToken;

  let isAdmin,
    isCertificationAuthority,
    isOrganism = false;

  if (accessToken) {
    const decodedToken = jwtDecode<{
      resource_access: { "reva-admin": { roles: string[] } };
    }>(accessToken);

    const roles = decodedToken.resource_access["reva-admin"].roles;
    isAdmin = roles.includes("admin");
    isCertificationAuthority = roles.includes("manage_feasibility");
    isOrganism = roles.includes("manage_candidacy");
  }
  return { isAdmin, isCertificationAuthority, isOrganism };
};
