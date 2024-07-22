import { Timeline } from "@/components/legacy/molecules/Timeline/Timeline";

import { ContactTimelineElement } from "./TimelineElements/ContactTimelineElement/ContactTimelineElement";
import { CertificationTimelineElement } from "./TimelineElements/CertificationTimelineElement/CertificationTimelineElement";
import { GoalsTimelineElement } from "./TimelineElements/GoalsTimelineElement/GoalsTimelineElement";
import { ExperiencesTimelineElement } from "./TimelineElements/ExperiencesTimelineElement/ExperiencesTimelineElement";
import { OrganismTimelineElement } from "./TimelineElements/OrganismTimelineElement/OrganismTimelineElement";
import { ProjectSubmissionTimelineElement } from "./TimelineElements/ProjectSubmissionTimelineElement/ProjectSubmissionTimelineElement";
import { FeasibilityAppointmentTimelineElement } from "./TimelineElements/FeasibilityAppointmentTimelineElement/FeasibilityAppointmentTimelineElement";
import { TrainingProgramTimelineElement } from "./TimelineElements/TrainingProgramTimelineElement/TrainingProgramTimelineElement";
import { FeasibilityPdfTimelineElement } from "./TimelineElements/FeasibilityPdfTimelineElement/FeasibilityPdfTimelineElement";
import { DossierDeValidationTimelineElement } from "./TimelineElements/DossierDeValidationTimelineElement/DossierDeValidationTimelineElement";
import { JuryTimelineElement } from "./TimelineElements/JuryTimelineElement/JuryTimelineElement";
import { ProjectEndedTimelineElement } from "./TimelineElements/ProjectEndedTimelineElement/ProjectEndedTimelineElement";
import { FeasibilityDematTimelineElement } from "./TimelineElements/FeasibilityDematTimelineElement/FeasibilityDematTimelineElement";
import { getCandidacy } from "@/app/home.loaders";

export const ProjectTimeline = async ({
  className,
  "data-test": dataTest,
}: {
  className?: string;
  "data-test"?: string;
}) => {
  const { candidacy } = await getCandidacy();

  const { feasibilityFormat, feasibility, jury } = candidacy;
  const REJECTED = feasibility?.decision == "REJECTED";

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

      {feasibilityFormat === "UPLOADED_PDF" ? (
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
