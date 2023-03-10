import { Timeline } from "components/molecules/Timeline/Timeline";
import { ProjectSubmissionTimelineElement } from "components/organisms/ProjectTimeline/TimelineElements/ProjectSubmissionTimelineElement/ProjectSubmissionTimelineElement";

import { CertificationTimelineElement } from "./TimelineElements/CertificationTimelineElement/CertificationTimelineElement";
import { ContactTimelineElement } from "./TimelineElements/ContactTimelineElement/ContactTimelineElement";
import { ExperiencesTimelineElement } from "./TimelineElements/ExperiencesTimelineElement/ExperiencesTimelineElement";
import { GoalsTimelineElement } from "./TimelineElements/GoalsTimelineElement/GoalsTimelineElement";
import { OrganismTimelineElement } from "./TimelineElements/OrganismTimelineElement/OrganismTimelineElement";

export const ProjectTimeline = ({
  isReadOnly,
  className,
  dataTest,
}: {
  isReadOnly?: boolean;
  className?: string;
  dataTest?: string;
}) => {
  return (
    <Timeline className={className} dataTest={dataTest}>
      <ContactTimelineElement />
      <CertificationTimelineElement readonly={isReadOnly} />
      <GoalsTimelineElement readonly={isReadOnly} />
      <ExperiencesTimelineElement readonly={isReadOnly} />
      <OrganismTimelineElement readonly={isReadOnly} />
      <ProjectSubmissionTimelineElement />
    </Timeline>
  );
};
