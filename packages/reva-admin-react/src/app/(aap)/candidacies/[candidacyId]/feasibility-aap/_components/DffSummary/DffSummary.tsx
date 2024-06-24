"use client";
import {
  Candidacy,
  Candidate,
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
import { useDffSummary } from "./_components/dffSummary.hook";

export default function DffSummary() {
  const { candidate, candidacy, dematerializedFeasibilityFile } =
    useDffSummary();

  if (!dematerializedFeasibilityFile) {
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
      <p className="text-xl mb-12">
        Vérifiez que toutes les informations soient correctes et envoyez le
        dossier de faisabilité au candidat. Il devra vous fournir une
        déclaration sur l'honneur pour valider ce dossier.
      </p>

      <CandidateSection candidate={candidate as Candidate} />
      <CertificationSection
        option={option}
        firstForeignLanguage={firstForeignLanguage}
        secondForeignLanguage={secondForeignLanguage}
        certification={certification}
        prerequisites={prerequisites as Prerequisite[]}
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
      <AttachmentsSection attachments={attachments as DffAttachment[]} />
    </div>
  );
}
