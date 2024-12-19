import { TimelineElement } from "@/components/legacy/molecules/Timeline/Timeline";
import { useGetSelfServiceFeasibilityFileTimelineInfo } from "./useGetSelfServiceFeasibilityFileTimelineInfo";

export const SelfServiceFeasibilityFileTimelineElement = () => {
  const { status, badge, notice, button } =
    useGetSelfServiceFeasibilityFileTimelineInfo();

  return (
    <TimelineElement
      title="Dossier de faisabilité"
      description="Un document important pour résumer vos expériences et tenter d'obtenir votre recevabilité !"
      status={status}
      badge={badge}
      data-test="feasibility-timeline-element"
    >
      {notice}
      {button}
    </TimelineElement>
  );
};
