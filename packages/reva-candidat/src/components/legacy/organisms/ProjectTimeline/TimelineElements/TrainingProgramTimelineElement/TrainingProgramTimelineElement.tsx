import { useRouter } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";

import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidateWithCandidacy } from "@/hooks/useCandidateWithCandidacy";

export const TrainingProgramTimelineElement = () => {
  const router = useRouter();

  const { candidacyStatus, candidacy } = useCandidateWithCandidacy();

  if (!candidacy) {
    return null;
  }

  let status: TimeLineElementStatus = "readonly";
  if (candidacyStatus == "PARCOURS_ENVOYE") {
    status = "active";
  } else if (
    candidacyStatus == "PROJET" ||
    candidacyStatus == "VALIDATION" ||
    candidacyStatus == "PRISE_EN_CHARGE"
  ) {
    status = "disabled";
  }

  return (
    <TimelineElement
      title="Validation de parcours"
      description={
        <p className="text-sm text-dsfrGray-500 mt-4 mb-0" role="status">
          {candidacyStatus === "PROJET" ? null : candidacyStatus ==
              "VALIDATION" || candidacyStatus == "PRISE_EN_CHARGE" ? (
            <>
              Votre organisme d’accompagnement va bientôt vous contacter pour
              définir avec vous votre parcours d’accompagnement. Vous pourrez
              prochainement valider le nombre d’heures d’accompagnement et de
              formation prévues.
            </>
          ) : (
            <>
              Validez le nombre d’heures d’accompagnement et de formation défini
              par votre référent
            </>
          )}
        </p>
      }
      status={status}
    >
      {status === "readonly" ? (
        <Button
          data-test="view-training-program-button"
          className="mt-2"
          priority="secondary"
          nativeButtonProps={{
            onClick: () => {
              router.push("validate-training");
            },
          }}
        >
          Consultez votre parcours
        </Button>
      ) : (
        candidacyStatus === "PARCOURS_ENVOYE" && (
          <Button
            data-test="validate-training-program-button"
            className="mt-2"
            priority="secondary"
            nativeButtonProps={{
              onClick: () => {
                router.push("validate-training");
              },
              disabled: status === "disabled",
            }}
          >
            Validez votre parcours
          </Button>
        )
      )}
    </TimelineElement>
  );
};
