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
  const { isFeatureActive } = useFeatureflipping();
  const { isVisibleInSearchResults } = useAAPVisibilityCheck();
  const pathname = usePathname();
  const isFeatureAapCguActive = isFeatureActive("AAP_CGU");
  const isFeaturNoticeAlertFundingLimitActive = isFeatureActive(
    "NOTICE_ALERT_FUNDING_LIMIT",
  );

  const isCguPathname =
    pathname.startsWith("/information") || pathname.startsWith("/cgu");

  const { getMaisonMereCGU } = useAppCgu();

  const cgu =
    getMaisonMereCGU.data?.account_getAccountForConnectedUser?.maisonMereAAP
      ?.cgu;

  const canSeeAapCgu =
    authenticated &&
    isGestionnaireMaisonMereAAP &&
    isFeatureAapCguActive &&
    !isCguPathname &&
    !cgu?.isLatestVersion;

  const canSeeAAPNotVisibleInSearchResultNotice =
    authenticated &&
    !isAdmin &&
    !isGestionnaireMaisonMereAAP &&
    isOrganism &&
    !isVisibleInSearchResults;

  const canSeeNoticeAlertFundingLimit = isFeaturNoticeAlertFundingLimitActive;

  const canSeeNoticeAapSettings = pathname === "/agencies-settings/";

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
