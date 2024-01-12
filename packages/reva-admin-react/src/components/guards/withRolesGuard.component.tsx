import { redirect } from "next/navigation";

import { ADMIN_ELM_URL } from "@/config/config";

import { UserRole } from "../auth/types";
import { useAuth } from "../auth/auth";
import { useHasRoles } from "../auth/role";

interface Props {
  roles: UserRole[];
  children: React.ReactNode;
}

export const RolesGuard = (props: Props): JSX.Element => {
  const { children, roles } = props;

  const { hasRoles } = useHasRoles();
  const {
    isAdmin,
    isCertificationAuthority,
    isOrganism,
    isGestionnaireMaisonMereAAP,
    isAdminCertificationAuthority,
  } = useAuth();

  // Redirect user to default path based on role
  if (!hasRoles(roles)) {
    if (isAdmin || isOrganism || isGestionnaireMaisonMereAAP) {
      redirect(ADMIN_ELM_URL + "/candidacies");
    } else if (isAdminCertificationAuthority || isCertificationAuthority) {
      redirect("/feasibilities");
    }

    return <div>Vous n'avez pas accès à cette fonctionnalité</div>;
  }

  return <>{children}</>;
};

export const withRolesGuard =
  (roles: UserRole[]) =>
  <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const WithRolesGuard = (props: P) => {
      return (
        <RolesGuard roles={roles}>
          <WrappedComponent {...props} />
        </RolesGuard>
      );
    };

    WithRolesGuard.displayName = `WithRolesGuard(${getDisplayName(
      WrappedComponent,
    )})`;

    return WithRolesGuard;
  };

/**
 * Get display name for HOCs
 * Used for cleaner names in react dev tools
 */

const getDisplayName = (WrappedComponent: React.ComponentType<any>) =>
  WrappedComponent.displayName || WrappedComponent.name || "Component";
