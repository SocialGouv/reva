"use client";
import {
  Candidacy,
  Candidate,
  DematerializedFeasibilityFile,
  DffAttachment,
  Prerequisite,
} from "@/graphql/generated/graphql";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";
import AttachmentsSection from "./_components/AttachmentsSection";
import CandidateSection from "./_components/CandidateSection";
import CertificationSection from "./_components/CertificationSection";
import DecisionSection from "./_components/DecisionSection";
import ExperiencesSection from "./_components/ExperiencesSection";
import GoalsSection from "./_components/GoalsSection";
import ParcoursSection from "./_components/ParcoursSection";

export default function DffSummary({
  dematerializedFeasibilityFile,
}: {
  dematerializedFeasibilityFile?: DematerializedFeasibilityFile;
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

      {sentToCandidateAt ? (
        <Alert
          description={`Dossier envoyé au certificateur le ${format(sentToCandidateAt, "dd/MM/yyyy")}`}
          severity="success"
          title=""
          className="mb-12"
        />
      ) : (
        <p className="text-xl mb-12">
          Vérifiez que toutes les informations soient correctes et envoyez le
          dossier de faisabilité au candidat. Il devra vous fournir une
          déclaration sur l'honneur pour valider ce dossier.
        </p>
      )}

      <CandidateSection candidate={candidacy?.candidate as Candidate} />
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
