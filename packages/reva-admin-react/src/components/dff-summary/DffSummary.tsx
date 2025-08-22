"use client";

import { deburr } from "lodash";

import { REST_API_URL } from "@/config/config";

import {
  Candidacy,
  Candidate,
  DematerializedFeasibilityFile,
  DffAttachment,
  DffEligibilityRequirement,
  Prerequisite,
} from "@/graphql/generated/graphql";

import { ContactInfosSection } from "../../app/contact-infos-section/ContactInfosSection";
import { useFeatureflipping } from "../feature-flipping/featureFlipping";

import AttachmentsSection from "./_components/AttachmentsSection";
import CandidateDecisionCommentSection from "./_components/CandidateDecisionCommentSection";
import CandidateSection from "./_components/CandidateSection";
import CertificationSection from "./_components/CertificationSection";
import DecisionSection from "./_components/DecisionSection";
import EligibilitySection from "./_components/EligibilitySection";
import ExperiencesSection from "./_components/ExperiencesSection";
import GoalsSection from "./_components/GoalsSection";
import ParcoursSection from "./_components/ParcoursSection";
import { PdfLink } from "./_components/PdfLink";

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
  const { isFeatureActive } = useFeatureflipping();

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

  const isUseGeneratedDffFileFromFileServerActive = isFeatureActive(
    "USE_GENERATED_DFF_FILE_FROM_FILE_SERVER",
  );

  const { candidate } = candidacy;

  const candidateName = deburr(
    `${candidate?.givenName ? candidate?.givenName : candidate?.lastname}_${candidate?.firstname}`,
  ).toLowerCase();

  const getPdfUrl = () => {
    return `${REST_API_URL}/candidacy/${candidacy.id}/feasibility/file-demat/${dematerializedFeasibilityFile.id}`;
  };

  return (
    <div className="flex flex-col" id="dff-to-print" data-test="dff-summary">
      <div className="flex justify-between mb-4">
        <h1 className="mb-0">Dossier de faisabilité</h1>

        {isUseGeneratedDffFileFromFileServerActive &&
        dematerializedFeasibilityFile.dffFile ? (
          <PdfLink
            text={"Télécharger le dossier de faisabilité"}
            title={"Télécharger le dossier de faisabilité"}
            url={dematerializedFeasibilityFile.dffFile.url}
            fileName={`dossier_de_faisabilite_${candidateName}.pdf`}
            className="fr-btn fr-btn--secondary fr-btn--sm"
          />
        ) : (
          <PdfLink
            text={"Télécharger le dossier de faisabilité"}
            title={"Télécharger le dossier de faisabilité"}
            url={getPdfUrl()}
            isBlobUrl
            fileName={`dossier_de_faisabilite_${candidateName}.pdf`}
            className="fr-btn fr-btn--secondary fr-btn--sm"
          />
        )}
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
