import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";
import {
  Candidate,
  DematerializedFeasibilityFile,
  DffAttachment,
  Prerequisite,
} from "graphql/generated/graphql";

import AttachmentsSection from "./components/AttachmentsSection";
import CandidateSection from "./components/CandidateSection";
import CertificationSection from "./components/CertificationSection";
import DecisionSection from "./components/DecisionSection";
import ExperiencesSection from "./components/ExperiencesSection";
import GoalsSection from "./components/GoalsSection";
import ParcoursSection from "./components/ParcoursSection";

interface Props {
  dematerializedFeasibilityFile: DematerializedFeasibilityFile;
}

export function DffSummary(props: Props) {
  const { dematerializedFeasibilityFile } = props;

  const { candidacy } = dematerializedFeasibilityFile;
  const { candidate } = candidacy;

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
      <h1>Dossier de faisabilité</h1>

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
          déclaration sur l'honneur pour valider ce dossier.
        </p>
      )}

      <CandidateSection candidate={candidate as Candidate} />
      <CertificationSection
        option={option}
        firstForeignLanguage={firstForeignLanguage}
        secondForeignLanguage={secondForeignLanguage}
        certification={certification}
        prerequisites={prerequisites as Prerequisite[]}
        blocsDeCompetences={blocsDeCompetences}
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
      <AttachmentsSection attachments={attachments as DffAttachment[]} />
    </div>
  );
}