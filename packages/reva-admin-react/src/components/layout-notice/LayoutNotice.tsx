import { useAuth } from "../auth/auth";
import { useKeycloakContext } from "../auth/keycloakContext";
import { useFeatureflipping } from "../feature-flipping/featureFlipping";
import {
  AAPNotVisibleInSearchResultNotice,
  useAAPVisibilityCheck,
} from "./_components/AAPNotVisibleInSearchResultNotice";
import { AlertFundingLimit } from "./_components/AlertFundingLimit";
import { AapCgu } from "./_components/AppCgu.component";
import { CustomInfoNotice } from "./_components/CustomInfoNotice";

export const LayoutNotice = () => {
  const { authenticated } = useKeycloakContext();
  const { isGestionnaireMaisonMereAAP, isAdmin, isOrganism } = useAuth();
  const { isFeatureActive } = useFeatureflipping();
  const { isVisibleInSearchResults } = useAAPVisibilityCheck();

  const isFeatureAapCguActive = isFeatureActive("AAP_CGU");
  const isFeaturNoticeAlertFundingLimitActive = isFeatureActive(
    "NOTICE_ALERT_FUNDING_LIMIT",
  );

  const canSeeAapCgu =
    authenticated && isGestionnaireMaisonMereAAP && isFeatureAapCguActive;

  const canSeeAAPNotVisibleInSearchResultNotice =
    authenticated &&
    !isAdmin &&
    !isGestionnaireMaisonMereAAP &&
    isOrganism &&
    !isVisibleInSearchResults;

  const canSeeNoticeAlertFundingLimit = isFeaturNoticeAlertFundingLimitActive;

  if (canSeeAapCgu) {
    return <AapCgu />;
  }

  if (canSeeAAPNotVisibleInSearchResultNotice) {
    return <AAPNotVisibleInSearchResultNotice />;
  }

  if (canSeeNoticeAlertFundingLimit) {
    return <AlertFundingLimit />;
  }

  return CustomInfoNotice({
    title:
      "Bon à savoir : paramétrer votre compte vous permet d'apparaître dans les recherches des candidats.",
  });
};
