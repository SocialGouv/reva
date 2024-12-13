import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { addMonths, isAfter, subWeeks } from "date-fns";
import { ActualisationBanner } from "./ActualisationBanner";
import { CaduqueBanner } from "./CaduqueBanner";
import { ContestationCaduciteConfirmedBanner } from "./ContestationCaduciteConfirmedBanner";
import { PendingContestationCaduciteBanner } from "./PendingContestationCaduciteBanner";
import { WelcomeBanner } from "./WelcomeBanner";

export const CandidacyBanner = () => {
  const { candidacy } = useCandidacy();
  const { isFeatureActive } = useFeatureFlipping();
  const candidacyActualisationFeatureIsActive = isFeatureActive(
    "candidacy_actualisation",
  );

  let todayIsAfterActualisationBannerThresholdDate: boolean = false;
  if (candidacy?.lastActivityDate) {
    const actualisationBannerThresholdDate = subWeeks(
      addMonths(candidacy.lastActivityDate, 6),
      2,
    );
    todayIsAfterActualisationBannerThresholdDate = isAfter(
      new Date(),
      actualisationBannerThresholdDate,
    );
  }

  const candidacyContestationsCaducite =
    candidacy?.candidacyContestationsCaducite;
  const lastActiveStatus = candidacy?.status;
  const isLastActiveStatusValidForActualisationBanner =
    lastActiveStatus === "DOSSIER_FAISABILITE_RECEVABLE" ||
    lastActiveStatus === "DOSSIER_DE_VALIDATION_SIGNALE";

  const displayActualisationBanner = !!(
    candidacy?.lastActivityDate &&
    candidacy?.feasibility?.decision === "ADMISSIBLE" &&
    candidacyActualisationFeatureIsActive &&
    todayIsAfterActualisationBannerThresholdDate &&
    isLastActiveStatusValidForActualisationBanner
  );

  const candidacyIsCaduque = !!candidacy?.isCaduque;
  const displayCaduqueBanner =
    candidacyIsCaduque && candidacyActualisationFeatureIsActive;

  const pendingContestationCaducite = candidacyContestationsCaducite?.find(
    (contestation) =>
      contestation?.certificationAuthorityContestationDecision ===
      "DECISION_PENDING",
  );
  const hasPendingContestationCaducite = !!pendingContestationCaducite;

  const displayContestationCaduciteHasBeenSent =
    candidacyIsCaduque &&
    candidacyActualisationFeatureIsActive &&
    hasPendingContestationCaducite;

  const hasConfirmedCaducite = !!candidacyContestationsCaducite?.some(
    (contestation) =>
      contestation?.certificationAuthorityContestationDecision ===
      "CADUCITE_CONFIRMED",
  );
  const displayContestationCaduciteConfirmed =
    candidacyIsCaduque &&
    candidacyActualisationFeatureIsActive &&
    hasConfirmedCaducite;

  if (displayContestationCaduciteConfirmed) {
    return <ContestationCaduciteConfirmedBanner />;
  }

  if (displayContestationCaduciteHasBeenSent) {
    return (
      <PendingContestationCaduciteBanner
        pendingContestationCaduciteSentAt={
          pendingContestationCaducite?.contestationSentAt
        }
      />
    );
  }

  if (displayCaduqueBanner) {
    return <CaduqueBanner />;
  }

  if (displayActualisationBanner) {
    return (
      <ActualisationBanner lastActivityDate={candidacy?.lastActivityDate} />
    );
  }

  return <WelcomeBanner />;
};
