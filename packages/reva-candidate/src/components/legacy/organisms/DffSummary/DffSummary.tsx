import { format } from "date-fns";
import { redirect } from "next/navigation";

import Alert from "@codegouvfr/react-dsfr/Alert";

import {
  Candidate,
  Certification,
  CertificationCompetenceDetails,
  Prerequisite,
} from "@/graphql/generated/graphql";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

import CandidateSection from "./components/CandidateSection";
import CertificationSection from "./components/CertificationSection";
import DecisionSection from "./components/DecisionSection";
import ExperiencesSection from "./components/ExperiencesSection";
import GoalsSection from "./components/GoalsSection";
import ParcoursSection from "./components/ParcoursSection";

export function DffSummary() {
  const { candidate, candidacy } = useCandidacy();

  const { feasibility } = candidacy;
  const dematerializedFeasibilityFile =
    feasibility?.dematerializedFeasibilityFile;

  if (!dematerializedFeasibilityFile) {
    redirect("/");
  }

  const {
    option,
    firstForeignLanguage,
    secondForeignLanguage,
    aapDecision,
    aapDecisionComment,
    prerequisites,
    sentToCandidateAt,
    blocsDeCompetences,
    certificationCompetenceDetails,
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
