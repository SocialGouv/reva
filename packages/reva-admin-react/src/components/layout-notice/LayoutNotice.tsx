import { usePathname } from "next/navigation";

import { useAuth } from "../auth/auth";
import { useKeycloakContext } from "../auth/keycloakContext";

import { AapCgu } from "./_components/AppCgu.component";
import { useAppCgu } from "./_components/AppCgu.hooks";

export const LayoutNotice = () => {
  const { authenticated } = useKeycloakContext();
  const { isGestionnaireMaisonMereAAP, isAdmin } = useAuth();

  const pathname = usePathname();

  const isCguPathname =
    pathname.startsWith("/information") || pathname.startsWith("/cgu");

  const { maisonMereCgu, getMaisonMereCGUisLoading } = useAppCgu();
  const isLoading = getMaisonMereCGUisLoading || status === "LOADING";
  const canSeeAapCgu =
    authenticated &&
    isGestionnaireMaisonMereAAP &&
    !isCguPathname &&
    maisonMereCgu &&
    !maisonMereCgu.isLatestVersion;

  if (isLoading || isAdmin) {
    return null;
  }

  if (canSeeAapCgu) {
    return <AapCgu />;
  }

  return null;
};
