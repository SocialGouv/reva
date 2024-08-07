import { Timeline } from "components/molecules/Timeline/Timeline";
import { FeasibilityAppointmentTimelineElement } from "components/organisms/ProjectTimeline/TimelineElements/FeasibilityAppointmentTimelineElement/FeasibilityAppointmentTimelineElement";
import { FeasibilityPdfTimelineElement } from "components/organisms/ProjectTimeline/TimelineElements/FeasibilityPdfTimelineElement/FeasibilityPdfTimelineElement";
import { ProjectEndedTimelineElement } from "components/organisms/ProjectTimeline/TimelineElements/ProjectEndedTimelineElement/ProjectEndedTimelineElement";
import { ProjectSubmissionTimelineElement } from "components/organisms/ProjectTimeline/TimelineElements/ProjectSubmissionTimelineElement/ProjectSubmissionTimelineElement";
import { TrainingProgramTimelineElement } from "components/organisms/ProjectTimeline/TimelineElements/TrainingProgramTimelineElement/TrainingProgramTimelineElement";
import { useMainMachineContext } from "contexts/MainMachineContext/MainMachineContext";
import { isBefore } from "date-fns";
import { FeasibilityFormat, FeasibilityPdfDecision } from "interface";

import { CertificationTimelineElement } from "./TimelineElements/CertificationTimelineElement/CertificationTimelineElement";
import { ContactTimelineElement } from "./TimelineElements/ContactTimelineElement/ContactTimelineElement";
import { DossierDeValidationTimelineElement } from "./TimelineElements/DossierDeValidationTimelineElement/DossierDeValidationTimelineElement";
import { ExperiencesTimelineElement } from "./TimelineElements/ExperiencesTimelineElement/ExperiencesTimelineElement";
import { FeasibilityDematTimelineElement } from "./TimelineElements/FeasibilityDematTimelineElement/FeasibilityDematTimelineElement";
import { GoalsTimelineElement } from "./TimelineElements/GoalsTimelineElement/GoalsTimelineElement";
import { JuryTimelineElement } from "./TimelineElements/JuryTimelineElement/JuryTimelineElement";
import { OrganismTimelineElement } from "./TimelineElements/OrganismTimelineElement/OrganismTimelineElement";

export const ProjectTimeline = ({
  className,
  "data-test": dataTest,
}: {
  className?: string;
  "data-test"?: string;
}) => {
  const { state } = useMainMachineContext();

  const { feasibilityFormat, feasibilityPdf, jury } = state.context;
  const REJECTED = feasibilityPdf?.decision === FeasibilityPdfDecision.REJECTED;

  return (
    <Timeline className={className} data-test={dataTest}>
      <ContactTimelineElement />
      <CertificationTimelineElement />
      <GoalsTimelineElement />
      <ExperiencesTimelineElement />
      <OrganismTimelineElement />
      <ProjectSubmissionTimelineElement />
      <FeasibilityAppointmentTimelineElement />
      <TrainingProgramTimelineElement />
      {feasibilityFormat === FeasibilityFormat.UPLOADED_PDF ? (
        <FeasibilityPdfTimelineElement />
      ) : (
        <FeasibilityDematTimelineElement />
      )}
      {!REJECTED && (
        <>
          <DossierDeValidationTimelineElement />
          <JuryTimelineElement />
        </>
      )}
      {jury?.result && <ProjectEndedTimelineElement />}
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
