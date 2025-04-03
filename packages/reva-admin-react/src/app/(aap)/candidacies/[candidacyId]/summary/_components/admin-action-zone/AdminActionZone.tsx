import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { ComponentProps } from "react";
import { useAdminActionZone } from "./adminActionZone.hooks";
import { graphqlErrorToast } from "@/components/toast/toast";
import { useConfirmFinanceModuleSwitchToHorsPlateformeModal } from "./modals/confirmFinanceModuleSwitchToHorsPlateformeModal.hook";
import { useConfirmTypeAccompagnementSwitchToAutonomeModal } from "./modals/confirmTypeAccompagnementSwitchToAutonomeModal.hook";

export const AdminActionZone = ({
  candidacyId,
  canBeArchived,
  canBeRestored,
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
          title="Archiver la candidature"
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
}: {
  title: string;
  linkProps?: ComponentProps<typeof Tile>["linkProps"];
  buttonProps?: ComponentProps<typeof Tile>["buttonProps"];
  disabled?: boolean;
  disabledDescription?: string;
  description?: string;
  detail?: string;
}) => (
  <Tile
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
  />
);

const AdminStaticTile = ({ title }: { title: string }) => (
  <Tile title={title} orientation="horizontal" small disabled />
);
