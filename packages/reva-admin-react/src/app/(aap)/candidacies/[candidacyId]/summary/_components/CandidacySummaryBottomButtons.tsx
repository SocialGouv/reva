import Button from "@codegouvfr/react-dsfr/Button";
import Tile from "@codegouvfr/react-dsfr/Tile";
import {
  CandidacyForStatus,
  useCandidacyStatus,
} from "../../_components/candidacy.hook";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { graphql } from "@/graphql/generated";
import { graphqlErrorToast } from "@/components/toast/toast";
import { useAuth } from "@/components/auth/auth";
import { ComponentProps } from "react";
import { FinanceModule, TypeAccompagnement } from "@/graphql/generated/graphql";

const updateCandidacyFinanceModuleToHorsPlateformeMutation = graphql(`
  mutation updateCandidacyFinanceModuleToHorsPlateforme($candidacyId: UUID!) {
    candidacy_updateFinanceModule(
      candidacyId: $candidacyId
      financeModule: hors_plateforme
    ) {
      id
    }
  }
`);

const updateCandidacyTypeAccompagnementToAutonomeMutation = graphql(`
  mutation updateCandidacyTypeAccompagnementToAutonome($candidacyId: UUID!) {
    candidacy_updateTypeAccompagnement(
      candidacyId: $candidacyId
      typeAccompagnement: AUTONOME
    ) {
      id
    }
  }
`);

export const CandidacySummaryBottomButtons = ({
  candidacyId,
  candidacy,
}: {
  candidacyId: string;
  candidacy: CandidacyForStatus & {
    financeModule: FinanceModule;
    typeAccompagnement: TypeAccompagnement;
  };
}) => {
  const {
    canBeArchived,
    canBeRestored,
    canDroput,
    canCancelDropout,
    canSwitchFinanceModuleToHorsPlateforme,
    canSwitchTypeAccompagnementToAutonome,
  } = useCandidacyStatus(candidacy);

  const { isAdmin } = useAuth();

  return (
    <div className="mt-8 flex flex-col">
      {canDroput && (
        <Button
          priority="secondary"
          className="ml-auto"
          linkProps={{
            href: `/candidacies/${candidacyId}/drop-out`,
            target: "_self",
          }}
        >
          Déclarer l'abandon du candidat
        </Button>
      )}

      {isAdmin && (
        <AdminActionsZone
          candidacyId={candidacyId}
          canBeArchived={canBeArchived}
          canBeRestored={canBeRestored}
          canCancelDropout={canCancelDropout}
          canSwitchFinanceModuleToHorsPlateforme={
            canSwitchFinanceModuleToHorsPlateforme
          }
          canSwitchTypeAccompagnementToAutonome={
            canSwitchTypeAccompagnementToAutonome
          }
          isAutonome={candidacy.typeAccompagnement === "AUTONOME"}
          isHorsPlateforme={candidacy.financeModule === "hors_plateforme"}
        />
      )}
    </div>
  );
};

const AdminActionsZone = ({
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
  const { graphqlClient } = useGraphQlClient();

  const queryClient = useQueryClient();

  const updateCandidacyFinanceModuleToHorsPlateforme = useMutation({
    mutationKey: [candidacyId],
    mutationFn: ({ candidacyId }: { candidacyId: string }) =>
      graphqlClient.request(
        updateCandidacyFinanceModuleToHorsPlateformeMutation,
        { candidacyId },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [candidacyId],
      });
    },
  });

  const updateCandidacyTypeAccompagnementToAutonome = useMutation({
    mutationKey: [candidacyId],
    mutationFn: ({ candidacyId }: { candidacyId: string }) =>
      graphqlClient.request(
        updateCandidacyTypeAccompagnementToAutonomeMutation,
        { candidacyId },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [candidacyId],
      });
    },
  });

  const handleUpdateCandidacyFinanceModuleToHorsPlateformeButtonClick =
    async () => {
      try {
        await updateCandidacyFinanceModuleToHorsPlateforme.mutateAsync({
          candidacyId,
        });
      } catch (e) {
        graphqlErrorToast(e);
      }
    };

  const handleUpdateCandidacyTypeAccompagnementToAutonomeButtonClick =
    async () => {
      try {
        await updateCandidacyTypeAccompagnementToAutonome.mutateAsync({
          candidacyId,
        });
      } catch (e) {
        graphqlErrorToast(e);
      }
    };

  const confirmFinanceModuleSwitchToHorsPlateformeModal = createModal({
    id: "confirm-finance-module-switch-to-hors-plateforme",
    isOpenedByDefault: false,
  });

  const confirmTypeAccompagnementSwitchToAutonomeModal = createModal({
    id: "confirm-type-accompagnement-switch-to-autonome",
    isOpenedByDefault: false,
  });

  return (
    <div className={`flex flex-col ${className || ""}`}>
      <confirmFinanceModuleSwitchToHorsPlateformeModal.Component
        title={
          <div className="flex gap-2">
            <span className="fr-icon-warning-fill" />
            Cette action est irréversible
          </div>
        }
        size="large"
        buttons={[
          {
            priority: "secondary",
            children: "Annuler",
          },
          {
            priority: "primary",
            children: "Confirmer",
            onClick:
              handleUpdateCandidacyFinanceModuleToHorsPlateformeButtonClick,
          },
        ]}
      >
        <div className="flex flex-col gap-4">
          <p>
            Le passage en hors financement privera ce candidat de tout prise en
            charge par France VAE. Êtes vous sûr de vouloir continuer ?
          </p>
        </div>
      </confirmFinanceModuleSwitchToHorsPlateformeModal.Component>

      <confirmTypeAccompagnementSwitchToAutonomeModal.Component
        title={
          <div className="flex gap-2">
            <span className="fr-icon-warning-fill" />
            Cette action est irréversible
          </div>
        }
        size="large"
        buttons={[
          {
            priority: "secondary",
            children: "Annuler",
          },
          {
            priority: "primary",
            children: "Confirmer",
            onClick:
              handleUpdateCandidacyTypeAccompagnementToAutonomeButtonClick,
          },
        ]}
      >
        <div className="flex flex-col">
          <p>
            Le changement de modalité effacera le choix de l’accompagnateur.
          </p>
          <p>
            Si une décision a déjà été prise sur le dossier de faisabilité, elle
            sera consultable dans la section concernée.
          </p>
          <p>Êtes vous sûr de vouloir continuer ?</p>
        </div>
      </confirmTypeAccompagnementSwitchToAutonomeModal.Component>

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

const AdminAction = ({
  title,
  linkProps,
  buttonProps,
  disabled,
  disabledDescription,
}: {
  title: string;
  linkProps?: ComponentProps<typeof Tile>["linkProps"];
  buttonProps?: ComponentProps<typeof Tile>["buttonProps"];
  disabled?: boolean;
  disabledDescription?: string;
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
    desc={disabled ? disabledDescription : undefined}
  />
);

const AdminStaticTile = ({ title }: { title: string }) => (
  <Tile title={title} orientation="horizontal" small disabled />
);
