import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";
import {
  Candidate,
  Certification,
  CertificationCompetenceDetails,
  Prerequisite,
} from "@/graphql/generated/graphql";

import CandidateSection from "./components/CandidateSection";
import CertificationSection from "./components/CertificationSection";
import DecisionSection from "./components/DecisionSection";
import ExperiencesSection from "./components/ExperiencesSection";
import GoalsSection from "./components/GoalsSection";
import ParcoursSection from "./components/ParcoursSection";

import { useCandidateWithCandidacy } from "@/hooks/useCandidateWithCandidacy";

export function DffSummary() {
  const { candidate, candidacy } = useCandidateWithCandidacy();

  if (!candidacy) {
    return;
  }

  const { dematerializedFeasibilityFile } = candidacy;

  if (!dematerializedFeasibilityFile) {
    return;
  }

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
  } = candidacy;

  return (
    <div className="flex flex-col">
      {sentToCandidateAt ? (
        <Alert
          description={`Dossier envoyé au certificateur le ${format(
            sentToCandidateAt,
            "dd/MM/yyyy",
          )}`}
          severity="success"
          title=""
          className="mb-12"
        />
      ) : (
        <p className="text-xl mb-12">
          Vérifiez que toutes les informations soient correctes et envoyez le
          dossier de faisabilité au candidat. Il devra vous fournir une
          déclaration sur l’honneur pour valider ce dossier.
        </p>
      )}

      <CandidateSection candidate={candidate as Candidate} />
      <CertificationSection
        option={option}
        firstForeignLanguage={firstForeignLanguage}
        secondForeignLanguage={secondForeignLanguage}
        certification={certification as Certification}
        prerequisites={prerequisites as Prerequisite[]}
        blocsDeCompetences={blocsDeCompetences.map(
          (bc) => bc.certificationCompetenceBloc,
        )}
        certificationCompetenceDetails={
          certificationCompetenceDetails as CertificationCompetenceDetails[]
        }
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
    </div>
  );
}
