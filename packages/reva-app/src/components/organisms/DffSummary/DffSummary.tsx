import Alert from "@codegouvfr/react-dsfr/Alert";
import { format } from "date-fns";
import {
  Candidacy,
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
  candidacy: Candidacy;
}

export function DffSummary(props: Props) {
  const { dematerializedFeasibilityFile, candidacy } = props;

  const { candidate } = candidacy;

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
  } = dematerializedFeasibilityFile;
  const {
    experiences,
    certification,
    feasibility,
    goals,
    basicSkills,
    mandatoryTrainings,
    additionalHourCount,
    individualHourCount,
    collectiveHourCount,
  } = candidacy;

  const sentToCertificationAuthorityAt = feasibility?.feasibilityFileSentAt;

  return (
    <div className="flex flex-col">
      {sentToCertificationAuthorityAt ? (
        <Alert
          description={`Dossier envoyé au certificateur le ${format(
            sentToCertificationAuthorityAt,
            "dd/MM/yyyy",
          )}`}
          severity="success"
          title=""
          className="mb-12"
        />
      ) : (
        <p className="text-xl mb-12">
          Vous avez en partie rempli ce dossier avec votre accompagnateur.
          Vérifiez les informations puis validez votre dossier en envoyant une
          attestation sur l’honneur à votre accompagnateur. Il se chargera
          ensuite de le transmettre au certificateur qui se prononcera sur la
          recevabilité.
        </p>
      )}
      <CandidateSection candidate={candidate as Candidate} />
      <CertificationSection
        option={option}
        firstForeignLanguage={firstForeignLanguage}
        secondForeignLanguage={secondForeignLanguage}
        certification={certification}
        prerequisites={prerequisites as Prerequisite[]}
        blocsDeCompetences={blocsDeCompetences.map(
          (b) => b.certificationCompetenceBloc,
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
      <AttachmentsSection attachments={attachments as DffAttachment[]} />
    </div>
  );
}
