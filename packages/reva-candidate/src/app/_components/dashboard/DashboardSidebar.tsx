import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";

import { CandidacyUseCandidateForDashboard } from "./dashboard.hooks";
import { AapContactTile } from "./tiles/AapContactTile";
import { ActualisationTile } from "./tiles/ActualisationTile";
import { AppointmentTiles } from "./tiles/AppointmentTiles";
import { CertificationAuthorityContactTile } from "./tiles/CertificationAuthorityContactTile";
import { NoContactTile } from "./tiles/NoContactTile";
import TileGroup from "./tiles/TileGroup";

export const DashboardSidebar = ({
  candidacy,
  className,
}: {
  candidacy: CandidacyUseCandidateForDashboard;
  className?: string;
}) => {
  const { isFeatureActive } = useFeatureFlipping();

  const removeFundingAndPaymentRequestsFromCandidacyStatusesFeatureActive =
    isFeatureActive(
      "REMOVE_FUNDING_AND_PAYMENT_REQUESTS_FROM_CANDIDACY_STATUSES",
    );

  const { status, activeDossierDeValidation } = candidacy;

  let isLastActiveStatusValidForActualisationBanner = false;

  if (removeFundingAndPaymentRequestsFromCandidacyStatusesFeatureActive) {
    isLastActiveStatusValidForActualisationBanner =
      status === "DOSSIER_FAISABILITE_RECEVABLE" ||
      status === "DOSSIER_DE_VALIDATION_SIGNALE" ||
      activeDossierDeValidation?.decision === "INCOMPLETE";
  } else {
    isLastActiveStatusValidForActualisationBanner =
      status === "DOSSIER_FAISABILITE_RECEVABLE" ||
      status === "DOSSIER_DE_VALIDATION_SIGNALE" ||
      status === "DEMANDE_FINANCEMENT_ENVOYE" ||
      (status === "DEMANDE_PAIEMENT_ENVOYEE" &&
        activeDossierDeValidation?.decision === "INCOMPLETE");
  }

  const displayActualisationTile =
    isLastActiveStatusValidForActualisationBanner &&
    !candidacy.isCaduque &&
    !candidacy.candidacyDropOut;

  return (
    <div
      className={`flex flex-col gap-y-8 ${className || ""}`}
      data-test="dashboard-sidebar"
    >
      <TileGroup
        icon="fr-icon-calendar-2-line"
        title="Mes prochains rendez-vous"
      >
        <AppointmentTiles candidacy={candidacy} />
      </TileGroup>
      {displayActualisationTile && (
        <ActualisationTile lastActivityDate={candidacy.lastActivityDate} />
      )}
      <TileGroup icon="fr-icon-team-line" title="Mes contacts">
        {!candidacy.organism &&
          !candidacy.feasibility?.certificationAuthority && <NoContactTile />}
        {candidacy.organism && <AapContactTile organism={candidacy.organism} />}
        {candidacy.feasibility?.certificationAuthority && (
          <CertificationAuthorityContactTile
            certificationAuthority={
              candidacy.feasibility.certificationAuthority
            }
            certificationAuthorityLocalAccounts={
              candidacy.certificationAuthorityLocalAccounts
            }
          />
        )}
      </TileGroup>
    </div>
  );
};
