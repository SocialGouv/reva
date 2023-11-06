import { Timeline } from "components/molecules/Timeline/Timeline";
import { AccompanimentTimelineElement } from "components/organisms/ProjectTimeline/TimelineElements/AccompanimentTimelineElement/AccompanimentTimelineElement";
import { ProjectEndedTimelineElement } from "components/organisms/ProjectTimeline/TimelineElements/ProjectEndedTimelineElement/ProjectEndedTimelineElement";
import { ProjectSubmissionTimelineElement } from "components/organisms/ProjectTimeline/TimelineElements/ProjectSubmissionTimelineElement/ProjectSubmissionTimelineElement";
import { TrainingProgramTimelineElement } from "components/organisms/ProjectTimeline/TimelineElements/TrainingProgramTimelineElement/TrainingProgramTimelineElement";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { isBefore } from "date-fns";

import { CertificationTimelineElement } from "./TimelineElements/CertificationTimelineElement/CertificationTimelineElement";
import { ContactTimelineElement } from "./TimelineElements/ContactTimelineElement/ContactTimelineElement";
import { ExperiencesTimelineElement } from "./TimelineElements/ExperiencesTimelineElement/ExperiencesTimelineElement";
import { GoalsTimelineElement } from "./TimelineElements/GoalsTimelineElement/GoalsTimelineElement";
import { OrganismTimelineElement } from "./TimelineElements/OrganismTimelineElement/OrganismTimelineElement";

export const ProjectTimeline = ({
  className,
  "data-test": dataTest,
}: {
  className?: string;
  "data-test"?: string;
}) => {
  return (
    <Timeline className={className} data-test={dataTest}>
      <ContactTimelineElement />
      <CertificationTimelineElement />
      <GoalsTimelineElement />
      <ExperiencesTimelineElement />
      <OrganismTimelineElement />
      <ProjectSubmissionTimelineElement />
      <TrainingProgramTimelineElement />
      <AccompanimentTimelineElement />
      <ProjectEndedTimelineElement />
    </Timeline>
  );
};

export const useProjectTimeline = () => {
  const { state } = useMainMachineContext();

  //candidate can edit project if a training has not been sent and if the first appointment date has not passed
  const canEditCandidacyAfterSubmission =
    (state.context.candidacyStatus === "PROJET" ||
      state.context.candidacyStatus === "VALIDATION" ||
      state.context.candidacyStatus === "PRISE_EN_CHARGE") &&
    (!state.context.firstAppointmentOccuredAt ||
      isBefore(new Date(), state.context.firstAppointmentOccuredAt));

  const candidacyAlreadySubmitted = state.context.candidacyStatus !== "PROJET";

  const getTimelineElementStatus = ({
    previousElementFilled,
    currentElementFilled,
  }: {
    previousElementFilled: boolean;
    currentElementFilled: boolean;
  }) =>
    canEditCandidacyAfterSubmission
      ? previousElementFilled || candidacyAlreadySubmitted
        ? currentElementFilled || candidacyAlreadySubmitted
          ? "editable"
          : "active"
        : "disabled"
      : "readonly";

  return { getTimelineElementStatus };
};
