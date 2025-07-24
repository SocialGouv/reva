import { usePathname } from "next/navigation";

import { useAuth } from "../auth/auth";
import { useKeycloakContext } from "../auth/keycloakContext";

import {
  AAPNotVisibleInSearchResultNotice,
  useAAPVisibilityCheck,
} from "./_components/AAPNotVisibleInSearchResultNotice";
import { AapCgu } from "./_components/AppCgu.component";
import { useAppCgu } from "./_components/AppCgu.hooks";

export const LayoutNotice = () => {
  const { authenticated } = useKeycloakContext();
  const { isGestionnaireMaisonMereAAP, isAdmin, isOrganism } = useAuth();
  const { isVisibleInSearchResults, getOrganismisLoading } =
    useAAPVisibilityCheck();
  const pathname = usePathname();

  const isCguPathname =
    pathname.startsWith("/information") || pathname.startsWith("/cgu");

  const { maisonMereCgu, getMaisonMereCGUisLoading } = useAppCgu();
  const isLoading =
    getMaisonMereCGUisLoading || getOrganismisLoading || status === "LOADING";
  const canSeeAapCgu =
    authenticated &&
    isGestionnaireMaisonMereAAP &&
    !isCguPathname &&
    maisonMereCgu &&
    !maisonMereCgu.isLatestVersion;

  const canSeeAAPNotVisibleInSearchResultNotice =
    authenticated &&
    !isGestionnaireMaisonMereAAP &&
    isOrganism &&
    !isVisibleInSearchResults;

  if (isLoading || isAdmin) {
    return null;
  }

  if (canSeeAapCgu) {
    return <AapCgu />;
  }

  if (canSeeAAPNotVisibleInSearchResultNotice) {
    return <AAPNotVisibleInSearchResultNotice />;
  }

  return null;
};
