import { useCandidacy } from "@/components/candidacy/candidacy.context";

import { Timeline } from "@/components/legacy/molecules/Timeline/Timeline";

import { ContactTimelineElement } from "./TimelineElements/general/ContactTimelineElement/ContactTimelineElement";
import { CertificationTimelineElement } from "./TimelineElements/general/CertificationTimelineElement/CertificationTimelineElement";
import { GoalsTimelineElement } from "./TimelineElements/accompagne/GoalsTimelineElement/GoalsTimelineElement";
import { ExperiencesTimelineElement } from "./TimelineElements/accompagne/ExperiencesTimelineElement/ExperiencesTimelineElement";
import { OrganismTimelineElement } from "./TimelineElements/general/OrganismTimelineElement/OrganismTimelineElement";
import { ProjectSubmissionTimelineElement } from "./TimelineElements/accompagne/ProjectSubmissionTimelineElement/ProjectSubmissionTimelineElement";
import { FeasibilityAppointmentTimelineElement } from "./TimelineElements/accompagne/FeasibilityAppointmentTimelineElement/FeasibilityAppointmentTimelineElement";
import { TrainingProgramTimelineElement } from "./TimelineElements/accompagne/TrainingProgramTimelineElement/TrainingProgramTimelineElement";
import { FeasibilityPdfTimelineElement } from "./TimelineElements/accompagne/FeasibilityPdfTimelineElement/FeasibilityPdfTimelineElement";
import { DossierDeValidationAccompagneLegacyTimelineElement } from "@/components/legacy/organisms/ProjectTimeline/TimelineElements/accompagne/DossierDeValidationAccompagneLegacyTimelineElement/DossierDeValidationAccompagneLegacyTimelineElement";
import { DossierDeValidationTimelineElement } from "@/components/legacy/organisms/ProjectTimeline/TimelineElements/general/DossierDeValidationTimelineElement/DossierDeValidationTimelineElement";
import { JuryTimelineElement } from "./TimelineElements/accompagne/JuryTimelineElement/JuryTimelineElement";
import { ProjectEndedTimelineElement } from "./TimelineElements/general/ProjectEndedTimelineElement/ProjectEndedTimelineElement";
import { FeasibilityDematTimelineElement } from "./TimelineElements/accompagne/FeasibilityDematTimelineElement/FeasibilityDematTimelineElement";
import { FeasibilityFormat } from "@/graphql/generated/graphql";
import { TypeAccompagnementTimelineElement } from "./TimelineElements/general/TypeAccompagnementTimelineElement/TypeAccompagnementTimelineElement";
import { SelfServiceFeasibilityFileTimelineElement } from "./TimelineElements/autonome/SelfServiceFeasibilityFileTimelineElement/SelfServiceFeasibilityFileTimelineElement";

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
    <AutonomeTimeline className={className} gotJuryResult={!!jury?.result} />
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
}) => (
  <Timeline className={className} data-test="accompagne-project-timeline">
    <ContactTimelineElement />
    <CertificationTimelineElement />
    <TypeAccompagnementTimelineElement />
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
        <DossierDeValidationAccompagneLegacyTimelineElement />
        <JuryTimelineElement />
      </>
    )}

    {gotJuryResult && <ProjectEndedTimelineElement />}
  </Timeline>
);

const AutonomeTimeline = ({
  className,
  gotJuryResult,
}: TimelineProps & { gotJuryResult: boolean }) => {
  return (
    <Timeline className={className} data-test="autonome-project-timeline">
      <ContactTimelineElement />
      <CertificationTimelineElement />
      <TypeAccompagnementTimelineElement />
      <SelfServiceFeasibilityFileTimelineElement />
      <DossierDeValidationTimelineElement />
      <JuryTimelineElement />
      {gotJuryResult && <ProjectEndedTimelineElement />}
    </Timeline>
  );
};
