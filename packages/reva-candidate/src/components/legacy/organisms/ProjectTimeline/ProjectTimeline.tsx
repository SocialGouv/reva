import { useCandidacy } from "@/components/candidacy/candidacy.context";

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
import { FeasibilityFormat } from "@/graphql/generated/graphql";
import { TypeAccompagnementTimelineElement } from "./TimelineElements/TypeAccompagnementTimelineElement/TypeAccompagnementTimelineElement";
import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";

interface TimelineProps {
  className?: string;
}

export const ProjectTimeline = ({ className }: TimelineProps) => {
  const { candidacy } = useCandidacy();

  const { feasibilityFormat, feasibility, jury } = candidacy;
  const feasibilityRejected = feasibility?.decision == "REJECTED";

  return candidacy.typeAccompagnement === "ACCOMPAGNE" ? (
    <AccompagneTimeline
      className={className}
      feasibilityFormat={feasibilityFormat}
      feasibilityRejected={feasibilityRejected}
      gotJuryResult={!!jury?.result}
    />
  ) : (
    <AutonomeTimeline className={className} />
  );
};

const AccompagneTimeline = ({
  className,
  feasibilityFormat,
  feasibilityRejected,
  gotJuryResult,
}: TimelineProps & {
  feasibilityFormat: FeasibilityFormat;
  feasibilityRejected: boolean;
  gotJuryResult: boolean;
}) => {
  const { isFeatureActive } = useFeatureFlipping();
  return (
    <Timeline className={className} data-test="accompagne-project-timeline">
      <ContactTimelineElement />
      <CertificationTimelineElement />
      {isFeatureActive("TYPE_ACCOMPAGNEMENT_CANDIDAT") && (
        <TypeAccompagnementTimelineElement />
      )}
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

      {!feasibilityRejected && (
        <>
          <DossierDeValidationTimelineElement />
          <JuryTimelineElement />
        </>
      )}

      {gotJuryResult && <ProjectEndedTimelineElement />}
    </Timeline>
  );
};

const AutonomeTimeline = ({ className }: TimelineProps) => {
  return (
    <Timeline className={className} data-test="autonome-project-timeline">
      <ContactTimelineElement />
      <CertificationTimelineElement />
      <TypeAccompagnementTimelineElement />
    </Timeline>
  );
};
