import { Card } from "@codegouvfr/react-dsfr/Card";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { useMemo } from "react";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { candidateCanSubmitCandidacyToAap } from "@/utils/candidateCanSubmitCandidacyToAap.util";

import { DashboardBanner } from "./banners/DashboardBanner";
import { DashboardSidebar } from "./dashboard-sidebar/DashboardSidebar";
import { useCandidacyForDashboard } from "./dashboard.hooks";
import { DashboardAccompagneTilesGroup } from "./persona-tiles-group/DashboardAccompagneTilesGroup";
import { DashboardAutonomeTilesGroup } from "./persona-tiles-group/DashboardAutonomeTilesGroup";
import { DashboardVaeCollectiveTilesGroup } from "./persona-tiles-group/DashboardVaeCollectiveTilesGroup";

const modalDistanceInfo = createModal({
  id: "abandon-candidature-info",
  isOpenedByDefault: false,
});

const Dashboard = () => {
  const { candidacy, candidacyAlreadySubmitted, archiveCandidacy } =
    useCandidacyForDashboard();
  const { isFeatureActive } = useFeatureFlipping();
  const isNextActionsFeatureActive = isFeatureActive("CANDIDATE_NEXT_ACTIONS");

  const hasSelectedCertification = useMemo(
    () => candidacy?.certification?.id !== undefined,
    [candidacy],
  );

  const hasCompletedGoals = useMemo(
    () => (candidacy?.goals && candidacy.goals.length > 0) || false,
    [candidacy],
  );

  const hasCompletedExperience = useMemo(
    () => (candidacy?.experiences && candidacy.experiences.length > 0) || false,
    [candidacy],
  );

  const hasSelectedOrganism = useMemo(
    () => candidacy?.organism?.id !== undefined,
    [candidacy],
  );

  const hasFeasibilitySent = useMemo(
    () => !!candidacy?.feasibility?.feasibilityFileSentAt,
    [candidacy],
  );

  const canSubmitCandidacy = useMemo(
    () =>
      candidateCanSubmitCandidacyToAap({
        hasSelectedCertification,
        hasCompletedGoals,
        hasSelectedOrganism,
        hasCompletedExperience,
        candidacyAlreadySubmitted,
      }),
    [
      hasSelectedCertification,
      hasCompletedGoals,
      hasSelectedOrganism,
      hasCompletedExperience,
      candidacyAlreadySubmitted,
    ],
  );

  if (!candidacy) {
    return null;
  }

  const candidacyIsAutonome = candidacy.typeAccompagnement === "AUTONOME";
  const candidacyIsAccompagne = candidacy.typeAccompagnement === "ACCOMPAGNE";
  const candidacyIsVaeCollective = !!candidacy.cohorteVaeCollective;

  const handleCandidacyDropOut = () => {
    archiveCandidacy.mutateAsync();
  };

  const NonVaeCollectiveDashboard = () => (
    <div className="flex flex-col-reverse lg:flex-row gap-8 mt-20">
      <div className="basis-2/3 flex flex-col gap-8">
        {candidacyIsAutonome && (
          <DashboardAutonomeTilesGroup candidacy={candidacy} />
        )}
        {candidacyIsAccompagne && (
          <DashboardAccompagneTilesGroup
            candidacy={candidacy}
            candidacyAlreadySubmitted={candidacyAlreadySubmitted}
            canSubmitCandidacy={canSubmitCandidacy}
            hasSelectedOrganism={hasSelectedOrganism}
            hasCompletedGoals={hasCompletedGoals}
          />
        )}

        {!hasFeasibilitySent && (
          <Tile
            title="Abandonner cette candidature"
            desc={
              <div className="text-dsfr-light-text-mention-grey">
                Voir les conséquences et valider la décision.
              </div>
            }
            small
            className="h-24"
            orientation="horizontal"
            buttonProps={{
              onClick: modalDistanceInfo.open,
            }}
          />
        )}
      </div>
      <DashboardSidebar
        candidacy={candidacy}
        className="basis-1/3"
        isNextActionsFeatureActive={isNextActionsFeatureActive}
      />

      <modalDistanceInfo.Component
        iconId="fr-icon-warning-fill"
        title={<span className="ml-2">Abandonner cette candidature ?</span>}
        buttons={[
          {
            priority: "secondary",
            children: "Annuler",
            nativeButtonProps: {
              "aria-label": "Annuler la suppression",
            },
          },
          {
            priority: "primary",
            onClick: handleCandidacyDropOut,
            children: "Confirmer",
            disabled: false,
            nativeButtonProps: {
              "aria-label": "Confirmer la suppression de la candidature",
            },
          },
        ]}
      >
        <p>
          Vous êtes sur le point d’abandonner votre candidature sur la
          certification{" "}
          <strong>RNCP {candidacy.certification?.codeRncp}</strong>:{" "}
          <strong>{candidacy.certification?.label}</strong>.
        </p>

        <p>Conséquences d’un abandon à ce stade :</p>

        <ul className="m-0 mb-6 font-bold">
          <li>vous perdrez les éléments renseignés dans cette candidature</li>
          <li>
            vous pourrez créer une nouvelle candidature sur la même
            certification
          </li>
          <li>
            si un financement a été validé, tournez-vous vers votre
            accompagnateur. La gestion du financement se fait hors plateforme
            France VAE.
          </li>
        </ul>

        <p>Confirmez vous l’abandon de cette candidature ? </p>
      </modalDistanceInfo.Component>
    </div>
  );

  const VaeCollectiveDashboard = () => (
    <div className="flex flex-col gap-8 mt-20">
      <Card
        size="small"
        classes={{ title: "text-xs text-dsfrGray-500", content: "pb-0" }}
        title={
          <span>
            <span className="fr-icon--sm fr-icon-building-fill mr-2" />
            {
              candidacy.cohorteVaeCollective?.commanditaireVaeCollective
                ?.raisonSociale
            }
          </span>
        }
        desc={
          <div className="text-dsfrGray-titleGrey text-xl font-bold">
            {candidacy.cohorteVaeCollective?.nom}
          </div>
        }
      />
      <div className="flex flex-col-reverse lg:flex-row gap-8">
        <DashboardVaeCollectiveTilesGroup
          className="basis-2/3"
          candidacy={candidacy}
          candidacyAlreadySubmitted={candidacyAlreadySubmitted}
          canSubmitCandidacy={canSubmitCandidacy}
          hasSelectedOrganism={hasSelectedOrganism}
          hasCompletedGoals={hasCompletedGoals}
        />
        <DashboardSidebar
          candidacy={candidacy}
          className="basis-1/3"
          isNextActionsFeatureActive={isNextActionsFeatureActive}
        />
      </div>
    </div>
  );

  return (
    <div>
      {candidacy.certification && (
        <p className="text-xl">
          RNCP {candidacy.certification.codeRncp} :{" "}
          {candidacy.certification.label}
        </p>
      )}
      <DashboardBanner
        candidacy={candidacy}
        canSubmitCandidacy={canSubmitCandidacy}
        candidacyAlreadySubmitted={candidacyAlreadySubmitted}
      />
      {candidacyIsVaeCollective ? (
        <VaeCollectiveDashboard />
      ) : (
        <NonVaeCollectiveDashboard />
      )}
    </div>
  );
};

export default Dashboard;
