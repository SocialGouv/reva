import { useAuth } from "@/components/auth/auth";
import { ADMIN_ELM_URL } from "@/config/config";
import Button from "@codegouvfr/react-dsfr/Button";

export const CandidacySummaryBottomButtons = ({
  candidacyId,
  isCandidacyArchived,
  isCandidacyDroppedOut,
  isCandidacyReoriented,
}: {
  candidacyId: string;
  isCandidacyArchived?: boolean;
  isCandidacyReoriented?: boolean;
  isCandidacyDroppedOut?: boolean;
}) => {
  const { isAdmin } = useAuth();

  const isCandidacyArchivedAndNotReoriented =
    isCandidacyArchived && !isCandidacyReoriented;

  const showDeleteCandidacyButton = !isCandidacyArchivedAndNotReoriented;

  const showRestoreCandidacyButton = isCandidacyArchivedAndNotReoriented;

  const showDropOutCandidacyButton =
    !isCandidacyDroppedOut && !isCandidacyArchivedAndNotReoriented;

  const showCancelDropOutCandidacyButton =
    isCandidacyDroppedOut && !isCandidacyArchivedAndNotReoriented && isAdmin;

  return (
    <div className="mt-6 flex flex-col md:flex-row gap-4">
      {showDeleteCandidacyButton && (
        <Button
          priority="secondary"
          linkProps={{
            href: `${ADMIN_ELM_URL}/candidacies/${candidacyId}/archive`,
            target: "_self",
          }}
        >
          Supprimer la candidature
        </Button>
      )}
      {showRestoreCandidacyButton && (
        <Button
          priority="secondary"
          linkProps={{
            href: `${ADMIN_ELM_URL}/candidacies/${candidacyId}/unarchive`,
            target: "_self",
          }}
        >
          Restaurer la candidature
        </Button>
      )}
      {showDropOutCandidacyButton && (
        <Button
          priority="secondary"
          linkProps={{
            href: `${ADMIN_ELM_URL}/candidacies/${candidacyId}/drop-out`,
            target: "_self",
          }}
        >
          Déclarer l'abandon du candidat
        </Button>
      )}
      {showCancelDropOutCandidacyButton && (
        <Button
          priority="secondary"
          linkProps={{
            href: `${ADMIN_ELM_URL}/candidacies/${candidacyId}/cancel-drop-out`,
            target: "_self",
          }}
        >
          Annuler l'abandon du candidat
        </Button>
      )}
    </div>
  );
};
