import {
  TimelineElement,
  TimeLineElementStatus,
} from "@/components/legacy/molecules/Timeline/Timeline";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

export const TypeAccompagnementTimelineElement = () => {
  const { candidacy } = useCandidacy();

  let status: TimeLineElementStatus = "disabled";

  if (candidacy.certification) {
    status = "active";
  }

  return (
    <TimelineElement
      title="Nécessité d’accompagnement"
      status={status}
      data-test="type-accompagnement-timeline-element"
    >
      <h4
        data-test="type-accompagnement-timeline-element-label"
        className="mb-4 text-base font-normal"
      >
        {candidacy.typeAccompagnement === "ACCOMPAGNE" && "VAE accompagnée"}
        {candidacy.typeAccompagnement === "AUTONOME" && "VAE en autonomie"}
      </h4>
    </TimelineElement>
  );
};
