"use client";
import {
  Candidacy,
  Candidate,
  DematerializedFeasibilityFile,
  DffAttachment,
  DffEligibilityRequirement,
  Prerequisite,
} from "@/graphql/generated/graphql";
import dynamic from "next/dynamic";
import AttachmentsSection from "./_components/AttachmentsSection";
import CandidateDecisionCommentSection from "./_components/CandidateDecisionCommentSection";
import CandidateSection from "./_components/CandidateSection";
import { ContactInfosSection } from "../../app/contact-infos-section/ContactInfosSection";
import CertificationSection from "./_components/CertificationSection";
import DecisionSection from "./_components/DecisionSection";
import EligibilitySection from "./_components/EligibilitySection";
import ExperiencesSection from "./_components/ExperiencesSection";
import GoalsSection from "./_components/GoalsSection";
import ParcoursSection from "./_components/ParcoursSection";

// The ButtonConvertHtmlToPdf component uses html2pdf, which relies on the window object and causes issues during server-side rendering (SSR) builds.
// We use dynamic import to ensure the component is only loaded on the client side.
const ButtonConvertHtmlToPdf = dynamic(
  () =>
    import(
      "@/components/button-convert-html-to-pdf/ButtonConvertHtmlToPdf"
    ).then((mod) => mod.ButtonConvertHtmlToPdf),
  { ssr: false },
);

export function DffSummary({
  dematerializedFeasibilityFile,
  candidacy,
  FeasibilityBanner,
  displayGiveYourDecisionSubtitle = false,
}: {
  dematerializedFeasibilityFile?: DematerializedFeasibilityFile;
  candidacy: Candidacy;
  FeasibilityBanner?: React.ReactNode;
  displayGiveYourDecisionSubtitle?: boolean;
  certificationAuthorityLabel?: string;
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
    <div className="flex flex-col" id="dff-to-print" data-test="dff-summary">
      <div className="flex justify-between mb-4">
        <h1 className="mb-0">Dossier de faisabilité</h1>
        <ButtonConvertHtmlToPdf
          label="Télécharger le dossier de faisabilité"
          elementId="dff-to-print"
          filename="dossier_de_faisabilite.pdf"
        />
      </div>
      {displayGiveYourDecisionSubtitle && (
        <p>
          Retrouvez les informations liées à la faisabilité de ce parcours VAE
          et donnez votre décision sur la recevabilité du dossier
        </p>
      )}

      {FeasibilityBanner}

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
          blocsDeCompetences={blocsDeCompetences}
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
        {candidacy.feasibility?.certificationAuthority && (
          <div className="mb-4">
            <ContactInfosSection
              certificationAuthority={
                candidacy.feasibility?.certificationAuthority
              }
              certificationAuthorityLocalAccounts={
                candidacy.certificationAuthorityLocalAccounts
              }
              organism={candidacy.organism}
            />
          </div>
        )}
      </div>
    </div>
  );
}
