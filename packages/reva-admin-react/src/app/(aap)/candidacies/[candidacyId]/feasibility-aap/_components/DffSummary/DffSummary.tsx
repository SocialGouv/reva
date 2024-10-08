"use client";
import { ButtonConvertHtmlToPdf } from "@/components/button-convert-html-to-pdf/ButtonConvertHtmlToPdf";
import {
  Candidacy,
  Candidate,
  DematerializedFeasibilityFile,
  DffAttachment,
  DffEligibilityRequirement,
  Prerequisite,
} from "@/graphql/generated/graphql";
import AttachmentsSection from "./_components/AttachmentsSection";
import CandidateDecisionCommentSection from "./_components/CandidateDecisionCommentSection";
import CandidateSection from "./_components/CandidateSection";
import CertificationSection from "./_components/CertificationSection";
import DecisionSection from "./_components/DecisionSection";
import EligibilitySection from "./_components/EligibilitySection";
import ExperiencesSection from "./_components/ExperiencesSection";
import GoalsSection from "./_components/GoalsSection";
import ParcoursSection from "./_components/ParcoursSection";

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
  const isEligibilityRequirementPartial =
    eligibilityRequirement === "PARTIAL_ELIGIBILITY_REQUIREMENT";
  return (
    <div className="flex flex-col" id="dff-to-print">
      <div className="flex justify-between mb-4">
        <h1 className="mb-0">Dossier de faisabilité</h1>
        <ButtonConvertHtmlToPdf
          label="Télécharger le dossier de faisabilité"
          elementId="dff-to-print"
          filename="dossier_de_faisabilite.pdf"
        />
      </div>
      <p>
        Retrouvez les informations liées à la faisabilité de ce parcours VAE et
        donnez votre décision sur la recevabilité du dossier
      </p>

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
