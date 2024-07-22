import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { FormatedCandidacy } from "@/app/home.loaders";
import { LinkButton } from "@/components/link-button/LinkButton";

export const CertificationTimelineElement = ({
  canEditCandidacy,
  candidacy,
}: {
  canEditCandidacy: boolean;
  candidacy: FormatedCandidacy["candidacy"];
}) => {
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
          <LinkButton
            href="/set-certification"
            data-test="project-home-set-certification"
          >
            {certification ? "Modifiez votre diplôme" : "Choisir votre diplôme"}
          </LinkButton>
        )}
      </>
    </TimelineElement>
  );
};
