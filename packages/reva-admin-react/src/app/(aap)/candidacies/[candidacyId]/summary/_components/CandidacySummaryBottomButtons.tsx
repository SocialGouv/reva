import Button from "@codegouvfr/react-dsfr/Button";
import {
  CandidacyForStatus,
  useCandidacyStatus,
} from "../../_components/candidacy.hook";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useGraphQlClient } from "@/components/graphql/graphql-client/GraphqlClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { graphql } from "@/graphql/generated";
import { graphqlErrorToast } from "@/components/toast/toast";

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
  candidacy: CandidacyForStatus;
}) => {
  const {
    canBeArchived,
    canBeRestored,
    canDroput,
    canCancelDropout,
    canSwitchFinanceModuleToHorsPlateforme,
    canSwitchTypeAccompagnementToAutonome,
  } = useCandidacyStatus(candidacy);

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
    <div className="mt-6 flex flex-col md:flex-row gap-4">
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
      {canBeArchived && (
        <Button
          priority="secondary"
          linkProps={{
            href: `/candidacies/${candidacyId}/archive`,
            target: "_self",
          }}
        >
          Supprimer la candidature
        </Button>
      )}
      {canBeRestored && (
        <Button
          priority="secondary"
          linkProps={{
            href: `/candidacies/${candidacyId}/unarchive`,
            target: "_self",
          }}
        >
          Restaurer la candidature
        </Button>
      )}
      {canDroput && (
        <Button
          priority="secondary"
          linkProps={{
            href: `/candidacies/${candidacyId}/drop-out`,
            target: "_self",
          }}
        >
          Déclarer l'abandon du candidat
        </Button>
      )}
      {canCancelDropout && (
        <Button
          priority="secondary"
          linkProps={{
            href: `/candidacies/${candidacyId}/cancel-drop-out`,
            target: "_self",
          }}
        >
          Annuler l'abandon du candidat
        </Button>
      )}
      {canSwitchFinanceModuleToHorsPlateforme && (
        <Button
          priority="secondary"
          onClick={confirmFinanceModuleSwitchToHorsPlateformeModal.open}
        >
          Passage en hors financement
        </Button>
      )}
      {canSwitchTypeAccompagnementToAutonome && (
        <Button
          priority="secondary"
          onClick={confirmTypeAccompagnementSwitchToAutonomeModal.open}
        >
          Passage en autonome
        </Button>
      )}
    </div>
  );
};
