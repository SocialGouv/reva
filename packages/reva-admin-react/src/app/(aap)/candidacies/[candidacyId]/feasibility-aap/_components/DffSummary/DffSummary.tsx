"use client";
import {
  Candidacy,
  Candidate,
  DematerializedFeasibilityFile,
  DffAttachment,
  Prerequisite,
} from "@/graphql/generated/graphql";
import AttachmentsSection from "./_components/AttachmentsSection";
import CandidateSection from "./_components/CandidateSection";
import CertificationSection from "./_components/CertificationSection";
import DecisionSection from "./_components/DecisionSection";
import ExperiencesSection from "./_components/ExperiencesSection";
import GoalsSection from "./_components/GoalsSection";
import ParcoursSection from "./_components/ParcoursSection";

export default function DffSummary({
  dematerializedFeasibilityFile,
  HasBeenSentComponent,
}: {
  dematerializedFeasibilityFile?: DematerializedFeasibilityFile;
  HasBeenSentComponent?: React.ReactNode;
}) {
  if (!dematerializedFeasibilityFile) {
    return null;
  }

  const { candidacy } = dematerializedFeasibilityFile;

  const {
    option,
    firstForeignLanguage,
    secondForeignLanguage,
    aapDecision,
    aapDecisionComment,
    attachments,
    prerequisites,
    sentToCandidateAt,
    blocsDeCompetences,
    certificationCompetenceDetails,
    swornStatementFile,
  } = dematerializedFeasibilityFile;
  const {
    experiences,
    certification,
    goals,
    basicSkills,
    mandatoryTrainings,
    additionalHourCount,
    individualHourCount,
    collectiveHourCount,
  } = candidacy as Candidacy;

  return (
    <div className="flex flex-col">
      <h1>Dossier de faisabilité</h1>

      {HasBeenSentComponent}

      <div className="flex flex-col gap-3">
        <CandidateSection candidate={candidacy?.candidate as Candidate} />
        <CertificationSection
          option={option}
          firstForeignLanguage={firstForeignLanguage}
          secondForeignLanguage={secondForeignLanguage}
          certification={certification}
          prerequisites={prerequisites as Prerequisite[]}
          blocsDeCompetences={blocsDeCompetences.map(
            (bc) => bc.certificationCompetenceBloc,
          )}
          certificationCompetenceDetails={certificationCompetenceDetails}
        />
        <ExperiencesSection experiences={experiences} />
        <ParcoursSection
          basicSkills={basicSkills}
          mandatoryTrainings={mandatoryTrainings}
          additionalHourCount={additionalHourCount}
          individualHourCount={individualHourCount}
          collectiveHourCount={collectiveHourCount}
        />
        <GoalsSection goals={goals} />
        <DecisionSection
          decision={aapDecision}
          decisionComment={aapDecisionComment}
        />
        <AttachmentsSection
          attachments={attachments as DffAttachment[]}
          swornStatementFile={swornStatementFile}
        />
      </div>
    </div>
  );
}
