import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { ComponentProps } from "react";

import { graphqlErrorToast } from "@/components/toast/toast";

import { useAdminActionZone } from "./adminActionZone.hooks";
import { useConfirmFinanceModuleSwitchToHorsPlateformeModal } from "./modals/confirmFinanceModuleSwitchToHorsPlateformeModal.hook";
import { useConfirmTypeAccompagnementSwitchToAutonomeModal } from "./modals/confirmTypeAccompagnementSwitchToAutonomeModal.hook";

export const AdminActionZone = ({
  candidacyId,
  canBeArchived,
  canBeRestored,
  canDropout,
  canCancelDropout,
  canSwitchFinanceModuleToHorsPlateforme,
  canSwitchTypeAccompagnementToAutonome,
  isAutonome,
  isHorsPlateforme,
  className,
}: {
  candidacyId: string;
  canBeArchived: boolean;
  canBeRestored: boolean;
  canDropout: boolean;
  canCancelDropout: boolean;
  canSwitchFinanceModuleToHorsPlateforme: boolean;
  canSwitchTypeAccompagnementToAutonome: boolean;
  isAutonome: boolean;
  isHorsPlateforme: boolean;
  className?: string;
}) => {
  const {
    updateCandidacyFinanceModuleToHorsPlateforme,
    updateCandidacyTypeAccompagnementToAutonome,
  } = useAdminActionZone({ candidacyId });

  const confirmFinanceModuleSwitchToHorsPlateformeModal =
    useConfirmFinanceModuleSwitchToHorsPlateformeModal();

  const confirmTypeAccompagnementSwitchToAutonomeModal =
    useConfirmTypeAccompagnementSwitchToAutonomeModal();

  const handleUpdateCandidacyFinanceModuleToHorsPlateformeButtonClick = async ({
    reason,
  }: {
    reason: string;
  }) => {
    try {
      await updateCandidacyFinanceModuleToHorsPlateforme.mutateAsync({
        candidacyId,
        reason,
      });
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  const handleUpdateCandidacyTypeAccompagnementToAutonomeButtonClick = async ({
    reason,
  }: {
    reason: string;
  }) => {
    try {
      await updateCandidacyTypeAccompagnementToAutonome.mutateAsync({
        candidacyId,
        reason,
      });
    } catch (e) {
      graphqlErrorToast(e);
    }
  };

  return (
    <div className={`flex flex-col ${className || ""}`}>
      <confirmFinanceModuleSwitchToHorsPlateformeModal.Component
        onConfirmButtonClick={
          handleUpdateCandidacyFinanceModuleToHorsPlateformeButtonClick
        }
      />

      <confirmTypeAccompagnementSwitchToAutonomeModal.Component
        onConfirmButtonClick={
          handleUpdateCandidacyTypeAccompagnementToAutonomeButtonClick
        }
      />

      <div className="bg-white border border-b-2 mt-8">
        <p className="text-xl font-bold my-0 leading-loose p-4 pl-6">
          <span className="fr-icon-user-star-line fr-icon--lg mr-2" />
          Actions admin FVAE
        </p>
      </div>

      {canDropout && (
        <AdminAction
          title="Déclarer l'abandon du candidat"
          description="Le candidat ne pourra plus déposer de dossier de faisabilité sur le même diplôme durant cette année civile."
          detail="Accessible tout au long du parcours."
          linkProps={{
            href: `/candidacies/${candidacyId}/drop-out`,
            target: "_self",
          }}
        />
      )}

      {canCancelDropout && (
        <AdminAction
          title="Annuler l'abandon du candidat"
          linkProps={{
            href: `/candidacies/${candidacyId}/cancel-drop-out`,
            target: "_self",
          }}
        />
      )}

      {isHorsPlateforme ? (
        <AdminStaticTile title="Parcours hors financement" />
      ) : (
        <AdminAction
          title="Passer en hors financement"
          buttonProps={{
            onClick: confirmFinanceModuleSwitchToHorsPlateformeModal.open,
          }}
          disabled={!canSwitchFinanceModuleToHorsPlateforme}
        />
      )}

      {isAutonome ? (
        <AdminStaticTile title="Parcours en autonomie" />
      ) : (
        <AdminAction
          title="Passer en autonomie"
          buttonProps={{
            onClick: confirmTypeAccompagnementSwitchToAutonomeModal.open,
          }}
          disabled={!canSwitchTypeAccompagnementToAutonome}
          disabledDescription="Disponible pour les candidatures en hors financement"
        />
      )}

      {canBeArchived && (
        <AdminAction
          data-testid="archive-candidacy-button"
          title="Archiver la candidature"
          description="Le candidat pourra refaire une candidature dans le cadre de France VAE (modification du diplôme, changement d’AAP, …)"
          detail="Accessible jusqu’au dépôt du dossier de faisabilité."
          linkProps={{
            href: `/candidacies/${candidacyId}/archive`,
            target: "_self",
          }}
        />
      )}
      {canBeRestored && (
        <AdminAction
          title="Restaurer la candidature"
          linkProps={{
            href: `/candidacies/${candidacyId}/unarchive`,
            target: "_self",
          }}
        />
      )}
    </div>
  );
};

export const AdminAction = ({
  title,
  linkProps,
  buttonProps,
  disabled,
  disabledDescription,
  description,
  detail,
  "data-test": dataTest,
  start,
}: {
  title: string;
  linkProps?: ComponentProps<typeof Tile>["linkProps"];
  buttonProps?: ComponentProps<typeof Tile>["buttonProps"];
  disabled?: boolean;
  disabledDescription?: string;
  description?: string;
  detail?: string;
  "data-test"?: string;
  start?: ComponentProps<typeof Tile>["start"];
}) => (
  <Tile
    data-test={dataTest}
    title={title}
    enlargeLinkOrButton
    orientation="horizontal"
    small
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- linkProps type is not correctly inferred
    linkProps={disabled ? undefined : (linkProps as any)}
    buttonProps={buttonProps || {}}
    disabled={disabled}
    desc={disabled ? disabledDescription : description}
    detail={detail}
    start={start}
  />
);

const AdminStaticTile = ({ title }: { title: string }) => (
  <Tile title={title} orientation="horizontal" small disabled />
);
