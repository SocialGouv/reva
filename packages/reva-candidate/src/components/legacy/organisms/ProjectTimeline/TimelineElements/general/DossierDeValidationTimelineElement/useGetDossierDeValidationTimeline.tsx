import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import { TimeLineElementStatus } from "@/components/legacy/molecules/Timeline/Timeline";
import { TimelineNotice } from "@/components/timeline-notice/TimelineNotice";
import Badge from "@codegouvfr/react-dsfr/Badge";
import { format } from "date-fns";

interface UseGetDossierDeValidationAutonomeTimelineInfo {
  status: TimeLineElementStatus;
  badge: React.ReactNode;
  notice: React.ReactNode;
}

const EDITABLE_STATUSES = [
  "DOSSIER_FAISABILITE_RECEVABLE",
  "DOSSIER_DE_VALIDATION_SIGNALE",
  "DEMANDE_FINANCEMENT_ENVOYE",
];

const ToCompleteBadge = (
  <Badge severity="warning" data-test="dossier-de-validation-to-complete-badge">
    À compléter
  </Badge>
);

export function useGetDossierDeValidationTimelineInfo(): UseGetDossierDeValidationAutonomeTimelineInfo {
  const { candidacy } = useCandidacy();
  const { isFeatureActive } = useFeatureFlipping();
  const candidacyActualisationFeatureIsActive = isFeatureActive(
    "candidacy_actualisation",
  );

  const dossierSignale = candidacy.status === "DOSSIER_DE_VALIDATION_SIGNALE";
  const isEditable = EDITABLE_STATUSES.includes(candidacy.status);
  const isReadOnly = candidacy.status === "DOSSIER_DE_VALIDATION_ENVOYE";
  const isCaduque = candidacy.isCaduque;

  switch (true) {
    case isCaduque && candidacyActualisationFeatureIsActive:
      return {
        status: "active",
        badge: null,
        notice: null,
      };

    case isEditable && !dossierSignale && !!candidacy.readyForJuryEstimatedAt:
      return {
        status: "active",
        badge: ToCompleteBadge,
        notice: (
          <TimelineNotice
            icon="fr-icon-info-fill"
            text={`Vous avez renseigné une date de dépôt prévisionnelle, le ${format(candidacy.readyForJuryEstimatedAt, "dd/MM/yyyy")}. Assurez-vous de bien transmettre votre dossier de validation à votre certificateur.`}
          />
        ),
      };
    case isEditable && dossierSignale:
      return {
        status: "active",
        badge: ToCompleteBadge,
        notice: (
          <TimelineNotice
            data-test="dossier-de-validation-signale-notice"
            icon="fr-icon-info-fill"
            text={`Le certificateur a signalé que votre dossier comportait des erreurs. Cliquez sur "Compléter" pour consulter ses remarques et le renvoyer.`}
          />
        ),
      };
    case isReadOnly:
      return {
        status: "readonly",
        badge: (
          <Badge
            severity="success"
            data-test="dossier-de-validation-sent-badge"
          >
            Envoyé
          </Badge>
        ),
        notice: (
          <TimelineNotice
            icon="fr-icon-info-fill"
            text="Votre certificateur est en train d'étudier votre dossier. En cas d'erreur ou d'oubli, contactez-le pour pouvoir le modifier dans les plus brefs délais."
          />
        ),
      };
    case isEditable:
      return {
        status: "active",
        badge: ToCompleteBadge,
        notice: null,
      };
    default:
      return {
        status: "disabled",
        badge: null,
        notice: null,
      };
  }
}
