import Button from "@codegouvfr/react-dsfr/Button";
import {
  CandidacyForStatus,
  useCandidacyStatus,
} from "../../_components/candidacy.hook";

export const CandidacySummaryBottomButtons = ({
  candidacyId,
  candidacy,
}: {
  candidacyId: string;
  candidacy: CandidacyForStatus;
}) => {
  const { canBeArchived, canBeRestored, canDroput, canCancelDropout } =
    useCandidacyStatus(candidacy);

  return (
    <div className="mt-6 flex flex-col md:flex-row gap-4">
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
    </div>
  );
};
