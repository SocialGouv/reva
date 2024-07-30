import { useRouter } from "next/navigation";

import { Button } from "@codegouvfr/react-dsfr/Button";

import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

export const CertificationTimelineElement = () => {
  const router = useRouter();

  const { canEditCandidacy, candidacy } = useCandidacy();

  const { certification } = candidacy;

  let status: TimeLineElementStatus = "active";
  if (!canEditCandidacy) {
    status = "readonly";
  } else if (certification) {
    status = "editable";
  }

  return (
    <TimelineElement title="Diplôme visé" status={status}>
      <>
        {certification && (
          <h4
            data-test="certification-label"
            className="mb-4 text-base font-normal"
          >
            {certification.label}
          </h4>
        )}

        {status !== "readonly" && (
          <Button
            data-test="project-home-set-certification"
            priority="secondary"
            onClick={() => {
              router.push("set-certification");
            }}
          >
            {certification ? "Modifiez votre diplôme" : "Choisir votre diplôme"}
          </Button>
        )}
      </>
    </TimelineElement>
  );
};
