import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { isDropOutConfirmed } from "@/utils/dropOutHelper";
import { addDays, isAfter } from "date-fns";
import { useRouter } from "next/navigation";
import { ActualisationBanner } from "./ActualisationBanner";
import { CaduqueBanner } from "./CaduqueBanner";
import { ContestationCaduciteConfirmedBanner } from "./ContestationCaduciteConfirmedBanner";
import { PendingContestationCaduciteBanner } from "./PendingContestationCaduciteBanner";
import { WelcomeBanner } from "./WelcomeBanner";
import { ACTUALISATION_THRESHOLD_DAYS } from "./banner-thresholds";
import { DropOutWarning } from "./drop-out-warning/DropOutWarning";

export const CandidacyBanner = () => {
  const { candidacy } = useCandidacy();
  const router = useRouter();
  const { isFeatureActive } = useFeatureFlipping();
  const candidacyActualisationFeatureIsActive = isFeatureActive(
    "candidacy_actualisation",
  );

  let todayIsAfterActualisationBannerThresholdDate: boolean = false;
  if (candidacy?.lastActivityDate) {
    const actualisationBannerThresholdDate = addDays(
      candidacy.lastActivityDate,
      ACTUALISATION_THRESHOLD_DAYS,
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
    lastActiveStatus === "DOSSIER_DE_VALIDATION_SIGNALE" ||
    lastActiveStatus === "DEMANDE_FINANCEMENT_ENVOYE" ||
    (lastActiveStatus === "DEMANDE_PAIEMENT_ENVOYEE" &&
      candidacy?.activeDossierDeValidation?.decision === "INCOMPLETE");

  const candidacyIsCaduque = !!candidacy?.isCaduque;
  const displayActualisationBanner = !!(
    candidacy?.lastActivityDate &&
    !candidacyIsCaduque &&
    candidacy?.feasibility?.decision === "ADMISSIBLE" &&
    candidacyActualisationFeatureIsActive &&
    todayIsAfterActualisationBannerThresholdDate &&
    isLastActiveStatusValidForActualisationBanner
  );

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

  if (candidacy?.candidacyDropOut) {
    return (
      <DropOutWarning
        className="mb-16"
        dropOutDate={new Date(candidacy.candidacyDropOut.createdAt)}
        dropOutConfirmed={isDropOutConfirmed({
          dropOutConfirmedByCandidate:
            candidacy.candidacyDropOut.dropOutConfirmedByCandidate,
          proofReceivedByAdmin: candidacy.candidacyDropOut.proofReceivedByAdmin,
          dropOutDate: new Date(candidacy.candidacyDropOut.createdAt),
        })}
        onDecisionButtonClick={() => router.push("/candidacy-dropout-decision")}
      />
    );
  }

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
