"use client";
import {
  Candidacy,
  Candidate,
  DematerializedFeasibilityFile,
  DffAttachment,
  DffEligibilityRequirement,
  Prerequisite,
} from "@/graphql/generated/graphql";
import AttachmentsSection from "./_components/AttachmentsSection";
import CandidateSection from "./_components/CandidateSection";
import CertificationSection from "./_components/CertificationSection";
import DecisionSection from "./_components/DecisionSection";
import EligibilitySection from "./_components/EligibilitySection";
import ExperiencesSection from "./_components/ExperiencesSection";
import GoalsSection from "./_components/GoalsSection";
import ParcoursSection from "./_components/ParcoursSection";
import CandidateDecisionCommentSection from "./_components/CandidateDecisionCommentSection";

export default function DffSummary({
  dematerializedFeasibilityFile,
  candidacy,
  HasBeenSentComponent,
}: {
  dematerializedFeasibilityFile?: DematerializedFeasibilityFile;
  candidacy: Candidacy;
  HasBeenSentComponent?: React.ReactNode;
}) {
  if (!dematerializedFeasibilityFile || !candidacy) {
    return null;
  }

  const {
    option,
    firstForeignLanguage,
    secondForeignLanguage,
    aapDecision,
    aapDecisionComment,
    attachments,
    prerequisites,
    blocsDeCompetences,
    certificationCompetenceDetails,
    swornStatementFile,
    eligibilityRequirement,
    eligibilityValidUntil,
    candidateDecisionComment,
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
        <EligibilitySection
          eligibilityRequirement={
            eligibilityRequirement as DffEligibilityRequirement | null
          }
          eligibilityValidUntil={eligibilityValidUntil as Date | null}
        />
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
          isCertificationPartial={candidacy?.isCertificationPartial}
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
        {candidateDecisionComment && (
          <CandidateDecisionCommentSection
            candidateDecisionComment={candidateDecisionComment}
          />
        )}
        <AttachmentsSection
          attachments={attachments as DffAttachment[]}
          swornStatementFile={swornStatementFile}
        />
      </div>
    </div>
  );
}
