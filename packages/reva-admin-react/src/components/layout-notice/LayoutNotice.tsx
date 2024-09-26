import { usePathname } from "next/navigation";
import { useAuth } from "../auth/auth";
import { useKeycloakContext } from "../auth/keycloakContext";
import { useFeatureflipping } from "../feature-flipping/featureFlipping";
import {
  AAPNotVisibleInSearchResultNotice,
  useAAPVisibilityCheck,
} from "./_components/AAPNotVisibleInSearchResultNotice";
import { AlertFundingLimit } from "./_components/AlertFundingLimit";
import { AapCgu } from "./_components/AppCgu.component";
import { useAppCgu } from "./_components/AppCgu.hooks";
import { CustomInfoNotice } from "./_components/CustomInfoNotice";

export const LayoutNotice = () => {
  const { authenticated } = useKeycloakContext();
  const { isGestionnaireMaisonMereAAP, isAdmin, isOrganism } = useAuth();
  const { isFeatureActive, status } = useFeatureflipping();
  const { isVisibleInSearchResults, getOrganismisLoading } =
    useAAPVisibilityCheck();
  const pathname = usePathname();
  const isFeatureAapCguActive = isFeatureActive("AAP_CGU");
  const isFeaturNoticeAlertFundingLimitActive = isFeatureActive(
    "NOTICE_ALERT_FUNDING_LIMIT",
  );

  const isCguPathname =
    pathname.startsWith("/information") || pathname.startsWith("/cgu");

  const { maisonMereCgu, getMaisonMereCGUisLoading } = useAppCgu();
  const isLoading =
    getMaisonMereCGUisLoading || getOrganismisLoading || status === "LOADING";
  const canSeeAapCgu =
    authenticated &&
    isGestionnaireMaisonMereAAP &&
    isFeatureAapCguActive &&
    !isCguPathname &&
    !maisonMereCgu?.isLatestVersion;

  const canSeeAAPNotVisibleInSearchResultNotice =
    authenticated && isOrganism && !isVisibleInSearchResults;

  const canSeeNoticeAlertFundingLimit =
    isFeaturNoticeAlertFundingLimitActive && isOrganism;

  const canSeeNoticeAapSettings =
    pathname === "/agencies-settings/" && isOrganism;

  if (isLoading || isAdmin) {
    return null;
  }

  if (canSeeAapCgu) {
    return <AapCgu />;
  }

  if (canSeeAAPNotVisibleInSearchResultNotice) {
    return <AAPNotVisibleInSearchResultNotice />;
  }

  if (canSeeNoticeAlertFundingLimit) {
    return <AlertFundingLimit />;
  }

  if (canSeeNoticeAapSettings) {
    return CustomInfoNotice({
      title:
        "Bon à savoir : paramétrer votre compte vous permet d'apparaître dans les recherches des candidats.",
    });
  }

  return null;
};
