import { format } from "date-fns";
import { redirect } from "next/navigation";

import Alert from "@codegouvfr/react-dsfr/Alert";

import {
  Candidate,
  Certification,
  CertificationCompetenceDetails,
  DffEligibilityRequirement,
  Prerequisite,
} from "@/graphql/generated/graphql";

import { useCandidacy } from "@/components/candidacy/candidacy.context";

import CandidateSection from "./components/CandidateSection";
import CertificationSection from "./components/CertificationSection";
import DecisionSection from "./components/DecisionSection";
import EligibilitySection from "./components/EligibilitySection";
import ExperiencesSection from "./components/ExperiencesSection";
import GoalsSection from "./components/GoalsSection";
import ParcoursSection from "./components/ParcoursSection";

export function DffSummary({
  candidateDecisionComment,
  setCandidateDecisionComment,
}: {
  candidateDecisionComment: string;
  setCandidateDecisionComment: (comment: string) => void;
}) {
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
    blocsDeCompetences,
    certificationCompetenceDetails,
    eligibilityRequirement,
    eligibilityValidUntil,
    candidateConfirmationAt,
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

  const sentToCertificationAuthorityAt = feasibility?.feasibilityFileSentAt;
  const isEligibilityRequirementPartial =
    eligibilityRequirement === "PARTIAL_ELIGIBILITY_REQUIREMENT";

  return (
    <div className="flex flex-col" id="dff-to-print">
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

      <EligibilitySection
        eligibilityRequirement={
          eligibilityRequirement as DffEligibilityRequirement | null
        }
        eligibilityValidUntil={eligibilityValidUntil as Date | null}
      />
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
        isCertificationPartial={!!candidacy?.isCertificationPartial}
        isEligibilityRequirementPartial={isEligibilityRequirementPartial}
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
        candidateDecisionComment={candidateDecisionComment}
        setCandidateDecisionComment={setCandidateDecisionComment}
        candidateDecisionCommentDisabled={!!candidateConfirmationAt}
      />
    </div>
  );
}
