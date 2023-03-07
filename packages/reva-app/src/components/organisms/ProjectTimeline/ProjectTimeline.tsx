import { Timeline } from "components/molecules/Timeline/Timeline";

import { CertificationTimelineElement } from "./TimelineElements/CertificationTimelineElement/CertificationTimelineElement";
import { ContactTimelineElement } from "./TimelineElements/ContactTimelineElement/ContactTimelineElement";
import { ExperiencesTimelineElement } from "./TimelineElements/ExperiencesTimelineElement/ExperiencesTimelineElement";
import { GoalsTimelineElement } from "./TimelineElements/GoalsTimelineElement/GoalsTimelineElement";
import { OrganismTimelineElement } from "./TimelineElements/OrganismTimelineElement/OrganismTimelineElement";

export const ProjectTimeline = ({
  isProjectValidated,
  className,
  dataTest,
}: {
  isProjectValidated?: boolean;
  className?: string;
  dataTest?: string;
}) => {
  return (
    <Timeline className={className} dataTest={dataTest}>
      <ContactTimelineElement />
      <CertificationTimelineElement readonly={isProjectValidated} />
      <GoalsTimelineElement readonly={isProjectValidated} />
      <ExperiencesTimelineElement readonly={isProjectValidated} />
      <OrganismTimelineElement readonly={isProjectValidated} />
    </Timeline>
  );
};
