"use client";
import { useAapFeasibilityPageLogic } from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/aapFeasibilityPageLogic";
import { DecisionSentComponent } from "@/components/alert-decision-sent-feasibility/DecisionSentComponent";
import { BannerIsCaduque } from "@/components/dff-summary/_components/BannerIsCaduque";
import { DffSummary } from "@/components/dff-summary/DffSummary";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import {
  Candidacy,
  Certification,
  CertificationCompetenceDetails,
  DematerializedFeasibilityFile,
  DfFileAapDecision,
  DffAttachment,
  DffCertificationCompetenceBloc,
  FeasibilityDecision,
  FeasibilityHistory,
  Prerequisite,
} from "@/graphql/generated/graphql";
import { dateThresholdCandidacyIsCaduque } from "@/utils/dateThresholdCandidacyIsCaduque";
import { AttachmentsSection } from "./_components/AttachmentsSection";
import { CandidateDecisionCommentSection } from "./_components/CandidateDecisionCommentSection";
import { CertificationSection } from "./_components/CertificationSection";
import { CompetenciesBlocksSection } from "./_components/CompetenciesBlocksSection";
import { DecisionSection } from "./_components/DecisionSection";
import { EligibilitySection } from "./_components/EligibilitySection";
import { PrerequisitesSection } from "./_components/PrerequisitesSection";
import { SendFileCandidateSection } from "./_components/SendFileCandidateSection";
import { SendFileCertificationAuthoritySection } from "./_components/SendFileCertificateurSection";
import { SwornStatementSection } from "./_components/SwornStatementSection";

const FeasibilityBanner = ({
  decisionSentAt,
  decision,
  decisionComment,
  history,
  dateSinceCandidacyIsCaduque,
  isCandidacyActualisationFeatureActive,
}: {
  decisionSentAt: Date | null;
  decision: FeasibilityDecision;
  decisionComment?: string | null;
  history?: FeasibilityHistory[];
  dateSinceCandidacyIsCaduque: Date | null;
  isCandidacyActualisationFeatureActive: boolean;
}) => {
  if (dateSinceCandidacyIsCaduque && isCandidacyActualisationFeatureActive) {
    return (
      <BannerIsCaduque
        dateSinceCandidacyIsCaduque={dateSinceCandidacyIsCaduque}
      />
    );
  }

  return (
    <DecisionSentComponent
      decisionSentAt={decisionSentAt}
      decision={decision}
      decisionComment={decisionComment}
      history={history}
    />
  );
};

const AapFeasibilityPage = () => {
  const {
    certification,
    dematerializedFeasibilityFile,
    queryStatus,
    feasibility,
    isCertificationPartial,
    candidacy,
  } = useAapFeasibilityPageLogic();
  const { isFeatureActive } = useFeatureflipping();
  const isCandidacyActualisationFeatureActive = isFeatureActive(
    "candidacy_actualisation",
  );

  const feasibilityFileSentAt = feasibility?.feasibilityFileSentAt;
  const isFeasibilityEditable =
    !feasibilityFileSentAt || feasibility?.decision === "INCOMPLETE";
  const isFeasibilityReceivedOrRejected =
    feasibility?.decision === "ADMISSIBLE" ||
    feasibility?.decision === "REJECTED";

  const isEligibilityRequirementPartial =
    dematerializedFeasibilityFile?.eligibilityRequirement ===
    "PARTIAL_ELIGIBILITY_REQUIREMENT";

  const dateSinceCandidacyIsCaduque = candidacy?.isCaduque
    ? dateThresholdCandidacyIsCaduque(candidacy.lastActivityDate as number)
    : null;

  if (!feasibility) {
    return null;
  }

  if (isFeasibilityReceivedOrRejected) {
    return (
      <DffSummary
        dematerializedFeasibilityFile={
          dematerializedFeasibilityFile as DematerializedFeasibilityFile
        }
        candidacy={candidacy as Candidacy}
        FeasibilityBanner={
          <FeasibilityBanner
            decisionSentAt={
              feasibility.decisionSentAt
                ? new Date(feasibility.decisionSentAt)
                : null
            }
            decision={feasibility.decision}
            decisionComment={feasibility.decisionComment}
            history={feasibility.history}
            dateSinceCandidacyIsCaduque={dateSinceCandidacyIsCaduque}
            isCandidacyActualisationFeatureActive={
              isCandidacyActualisationFeatureActive
            }
          />
        }
        certificationAuthorityLabel={feasibility?.certificationAuthority?.label}
      />
    );
  }

  return (
    <div className="flex flex-col">
      <h1>Dossier de faisabilité</h1>
      <p>
        Remplissez toutes les catégories afin de pouvoir envoyer le dossier au
        certificateur.
      </p>
      {queryStatus === "success" && (
        <ul className="flex flex-col gap-8">
          <EligibilitySection
            eligibilityRequirement={
              dematerializedFeasibilityFile?.eligibilityRequirement
            }
            eligibilityValidUntil={
              dematerializedFeasibilityFile?.eligibilityValidUntil
                ? new Date(dematerializedFeasibilityFile?.eligibilityValidUntil)
                : null
            }
            isFeasibilityEditable={isFeasibilityEditable}
          />
          <CertificationSection
            isCertificationPartial={!!isCertificationPartial}
            dematerializedFeasibilityFile={
              dematerializedFeasibilityFile as DematerializedFeasibilityFile
            }
            certification={certification as Certification}
            isFeasibilityEditable={isFeasibilityEditable}
          />
          <CompetenciesBlocksSection
            blocsDeCompetences={
              dematerializedFeasibilityFile?.blocsDeCompetences as DffCertificationCompetenceBloc[]
            }
            certificationCompetenceDetails={
              dematerializedFeasibilityFile?.certificationCompetenceDetails as CertificationCompetenceDetails[]
            }
            competenceBlocsPartCompletion={
              dematerializedFeasibilityFile?.competenceBlocsPartCompletion
            }
            disabled={
              !dematerializedFeasibilityFile?.certificationPartComplete ||
              isEligibilityRequirementPartial
            }
            disabledNoticeText={
              isEligibilityRequirementPartial
                ? "Vous n'avez pas besoin de compléter cette catégorie puisque votre candidat a déjà une recevabilité favorable en cours."
                : "Vous devez d'abord détailler la certification visée avant d'intégrer les prérequis."
            }
            isEditable={isFeasibilityEditable}
            isEligibilityRequirementPartial={isEligibilityRequirementPartial}
          />
          <PrerequisitesSection
            prerequisites={
              dematerializedFeasibilityFile?.prerequisites as Prerequisite[]
            }
            prerequisitesPartComplete={
              dematerializedFeasibilityFile?.prerequisitesPartComplete
            }
            disabled={!dematerializedFeasibilityFile?.certificationPartComplete}
            isEditable={isFeasibilityEditable}
          />
          <DecisionSection
            aapDecision={
              dematerializedFeasibilityFile?.aapDecision as DfFileAapDecision | null
            }
            aapDecisionComment={
              dematerializedFeasibilityFile?.aapDecisionComment as string | null
            }
            isEditable={isFeasibilityEditable}
            disabled={isEligibilityRequirementPartial}
          />
          <AttachmentsSection
            attachmentsPartComplete={
              dematerializedFeasibilityFile?.attachmentsPartComplete
            }
            isEditable={isFeasibilityEditable}
            attachments={
              dematerializedFeasibilityFile?.attachments as DffAttachment[]
            }
          />
          <hr />

          <h2>Vérifier et envoyer le dossier au candidat</h2>

          <SendFileCandidateSection
            sentToCandidateAt={
              dematerializedFeasibilityFile?.sentToCandidateAt as Date | null
            }
            isReadyToBeSentToCandidate={
              dematerializedFeasibilityFile?.isReadyToBeSentToCandidate
            }
          />
          {dematerializedFeasibilityFile?.candidateDecisionComment && (
            <CandidateDecisionCommentSection
              candidateDecisionComment={
                dematerializedFeasibilityFile.candidateDecisionComment as string
              }
            />
          )}
          <SwornStatementSection
            sentToCandidateAt={
              dematerializedFeasibilityFile?.sentToCandidateAt as Date | null
            }
            isCompleted={!!dematerializedFeasibilityFile?.swornStatementFile}
            isEditable={isFeasibilityEditable}
          />

          <hr className="pb-0.5" />

          <SendFileCertificationAuthoritySection
            sentToCertificationAuthorityAt={
              feasibilityFileSentAt ? new Date(feasibilityFileSentAt) : null
            }
            isReadyToBeSentToCertificationAuthority={
              dematerializedFeasibilityFile?.isReadyToBeSentToCertificationAuthority
            }
            decisionSentAt={
              feasibility.decisionSentAt
                ? new Date(feasibility.decisionSentAt)
                : null
            }
            decision={feasibility.decision}
            decisionComment={feasibility.decisionComment}
            history={feasibility.history}
          />
        </ul>
      )}
    </div>
  );
};

export default AapFeasibilityPage;
