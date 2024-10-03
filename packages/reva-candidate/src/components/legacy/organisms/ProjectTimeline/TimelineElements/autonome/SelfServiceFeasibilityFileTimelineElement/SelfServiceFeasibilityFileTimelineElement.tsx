import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useRouter } from "next/navigation";
import Badge from "@codegouvfr/react-dsfr/Badge";

export const SelfServiceFeasibilityFileTimelineElement = () => {
  const { candidacy } = useCandidacy();
  const router = useRouter();

  let status: TimeLineElementStatus = "disabled";

  const canComplete =
    !candidacy.feasibility || candidacy.feasibility.decision == "INCOMPLETE";

  if (canComplete) {
    status = "editable";
  }

  if (candidacy.status !== "PROJET" && !canComplete) {
    status = "readonly";
  }

  let badge = null;

  if (canComplete) {
    badge = <Badge severity="warning">À compléter</Badge>;
  } else if (candidacy.feasibility?.decision === "PENDING") {
    badge = <Badge severity="info">Envoyé</Badge>;
  } else if (candidacy.feasibility?.decision === "ADMISSIBLE") {
    badge = <Badge severity="success">Recevable</Badge>;
  } else if (candidacy.feasibility?.decision === "REJECTED") {
    badge = <Badge severity="error">Non-recevable</Badge>;
  }

  return (
    <TimelineElement
      title="Dossier de faisabilité"
      description="Un document important pour résumer vos expériences et tenter d’obtenir votre recevabilité !"
      status={status}
      badge={badge}
      data-test="feasibility-timeline-element"
    >
      {candidacy.feasibility?.decision === "PENDING" && (
        <div className="flex flex-row gap-4 w-3/5 text-dsfrGray-500 mb-4 italic">
          <span className="fr-icon-time-fill m-auto" />
          <p className="text-xs mb-0">
            Votre dossier est étudié par votre certificateur. En cas d’erreur ou
            d’oubli, contactez-le pour pouvoir le modifier dans les plus brefs
            délais. Si votre dossier est bon, vous recevrez une réponse dans un
            délai de 2 mois. S’il est considéré comme incomplet, vous devrez le
            modifier et le renvoyer.
          </p>
        </div>
      )}
      {candidacy.feasibility?.decision === "INCOMPLETE" && (
        <div className="flex flex-row gap-4 w-3/5 text-dsfrGray-500 mb-4 italic">
          <span className="fr-icon-info-fill m-auto" />
          <p className="text-xs mb-0">
            Selon le certificateur, votre dossier est incomplet. Cliquez sur
            “Compléter” pour consulter ses remarques et rajouter le ou les
            éléments manquants avant de renvoyer votre dossier de faisabilité.
          </p>
        </div>
      )}
      {candidacy.feasibility?.decision === "REJECTED" && (
        <div className="flex flex-row gap-4 w-3/5 text-dsfrGray-500 mb-4 italic">
          <span className="fr-icon-info-fill m-auto" />
          <p className="text-xs mb-0">
            Votre certificateur a estimé que votre dossier n’était pas recevable
            pour la suite de votre VAE.
          </p>
        </div>
      )}
      {candidacy.feasibility?.decision === "ADMISSIBLE" && (
        <div className="flex flex-row gap-4 w-3/5 text-dsfrGray-500 mb-4 italic">
          <span className="fr-icon-time-fill m-auto" />
          <p className="text-xs mb-0">
            Félicitations, votre dossier est recevable ! Vous pouvez poursuivre
            votre parcours VAE.
          </p>
        </div>
      )}
      {status !== "readonly" ? (
        <Button
          data-test="feasibility-timeline-element-update-button"
          priority="primary"
          onClick={() => {
            router.push("/feasibility");
          }}
          disabled={status === "disabled"}
        >
          Compléter
        </Button>
      ) : (
        <Button
          data-test="feasibility-timeline-element-review-button"
          priority="secondary"
          onClick={() => {
            router.push("/feasibility");
          }}
        >
          Consulter
        </Button>
      )}
    </TimelineElement>
  );
};
