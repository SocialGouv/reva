import { UserRole } from "./types";
import { useAuth } from "./auth";

export const useHasRoles = (): {
  hasRoles: (roles?: UserRole[]) => boolean;
} => {
  const { roles: userRoles } = useAuth();

  const hasRoles = (roles: UserRole[] = []): boolean => {
    for (const role of roles) {
      if (userRoles.includes(role)) {
        return true;
      }
    }

    return false;
  };

  return { hasRoles };
};
