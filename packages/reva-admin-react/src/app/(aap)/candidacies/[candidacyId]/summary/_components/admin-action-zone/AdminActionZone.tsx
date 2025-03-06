import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { graphqlErrorToast } from "@/components/toast/toast";
import { graphql } from "@/graphql/generated";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import Tile from "@codegouvfr/react-dsfr/Tile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ComponentProps } from "react";

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
            Vous êtes sur le point de passer ce candidat en parcours hors
            financement. Cette action est définitive et ne pourra pas être
            annulée.
          </p>
          <p className="mb-0">Êtes vous sûr de vouloir continuer ?</p>
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
            Passer ce candidat en parcours autonome est une action définitive.
            Cela supprimera certains éléments de son espace personnel :
          </p>
          <ul className="mb-6">
            <li>Objectifs</li>
            <li>Expériences</li>
            <li>Choix de l’accompagnateur</li>
          </ul>
          <p>
            Si une décision a déjà été prise sur le dossier de faisabilité, elle
            restera accessible dans la section concernée, sous le même format.
          </p>
          <p className="mb-0">Êtes vous sûr de vouloir continuer ?</p>
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
