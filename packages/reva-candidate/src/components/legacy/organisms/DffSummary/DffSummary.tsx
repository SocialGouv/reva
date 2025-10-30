import { redirect } from "next/navigation";

import { UseValidateFeasibilityCandidacy } from "@/app/[candidacyId]/(project)/(accompagne)/validate-feasibility/validate-feasibility.hooks";

import {
  Candidate,
  Certification,
  CertificationCompetenceDetails,
  DffCertificationCompetenceBloc,
  DffEligibilityRequirement,
  Prerequisite,
} from "@/graphql/generated/graphql";

import { BannerSummary } from "./components/BannerSummary";
import CandidateSection from "./components/CandidateSection";
import CertificationSection from "./components/CertificationSection";
import DecisionSection from "./components/DecisionSection";
import EligibilitySection from "./components/EligibilitySection";
import ExperiencesSection from "./components/ExperiencesSection";
import GoalsSection from "./components/GoalsSection";
import ParcoursSection from "./components/ParcoursSection";

type DffSummaryProps = {
  candidacy: UseValidateFeasibilityCandidacy;
  candidateDecisionComment: string;
  setCandidateDecisionComment: (comment: string) => void;
};

export function DffSummary({
  candidacy,
  candidateDecisionComment,
  setCandidateDecisionComment,
}: DffSummaryProps) {
  if (!candidacy) {
    return null;
  }

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

  const isEligibilityRequirementPartial =
    eligibilityRequirement === "PARTIAL_ELIGIBILITY_REQUIREMENT";

  return (
    <div className="flex flex-col gap-8">
      <BannerSummary
        feasibilitySentToCertificationAuthorityAt={
          feasibility.feasibilityFileSentAt
        }
      />

      <EligibilitySection
        eligibilityRequirement={
          eligibilityRequirement as DffEligibilityRequirement | null
        }
        eligibilityValidUntil={eligibilityValidUntil as Date | null}
      />
      <CertificationSection
        option={option}
        firstForeignLanguage={firstForeignLanguage}
        secondForeignLanguage={secondForeignLanguage}
        certification={certification as Certification}
        prerequisites={prerequisites as Prerequisite[]}
        isCertificationPartial={!!candidacy?.isCertificationPartial}
      />
      <CandidateSection candidate={candidacy.candidate as Candidate} />
      <GoalsSection goals={goals} />
      <ExperiencesSection
        experiences={experiences}
        blocsDeCompetences={
          blocsDeCompetences as DffCertificationCompetenceBloc[]
        }
        certificationCompetenceDetails={
          certificationCompetenceDetails as CertificationCompetenceDetails[]
        }
        isEligibilityRequirementPartial={isEligibilityRequirementPartial}
      />
      <ParcoursSection
        basicSkills={basicSkills}
        mandatoryTrainings={mandatoryTrainings}
        additionalHourCount={additionalHourCount}
        individualHourCount={individualHourCount}
        collectiveHourCount={collectiveHourCount}
      />
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
