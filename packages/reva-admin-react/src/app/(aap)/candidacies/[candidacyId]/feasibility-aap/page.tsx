"use client";
import { useAapFeasibilityPageLogic } from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/aapFeasibilityPageLogic";
import { DecisionSentComponent } from "@/components/alert-decision-sent-feasibility/DecisionSentComponent";
import {
  Candidacy,
  Certification,
  CertificationCompetenceDetails,
  DematerializedFeasibilityFile,
  DfFileAapDecision,
  DffAttachment,
  DffCertificationCompetenceBloc,
  FeasibilityDecision,
  Prerequisite,
} from "@/graphql/generated/graphql";
import { AttachmentsCard } from "./_components/AttachmentsCard";
import { CandidateDecisionCommentCard } from "./_components/CandidateDecisionCommentCard";
import { CertificationSection } from "./_components/CertificationSection";
import { CompetenciesBlocksSection } from "./_components/CompetenciesBlocksSection";
import { DecisionCard } from "./_components/DecisionCard";
import DffSummary from "./_components/DffSummary/DffSummary";
import { EligibilitySection } from "./_components/EligibilitySection";
import { PrerequisitesCard } from "./_components/PrerequisitesCard";
import { SendFileCandidateSection } from "./_components/SendFileCandidateSection";
import { SendFileCertificationAuthoritySection } from "./_components/SendFileCertificateurSection";
import { SwornStatementCard } from "./_components/SwornStatementCard";

const AapFeasibilityPage = () => {
  const {
    certification,
    dematerializedFeasibilityFile,
    queryStatus,
    feasibility,
    isCertificationPartial,
    candidacy,
  } = useAapFeasibilityPageLogic();

  const feasibilityFileSentAt = feasibility?.feasibilityFileSentAt;
  const isFeasibilityEditable =
    !feasibilityFileSentAt || feasibility?.decision === "INCOMPLETE";
  const isFeasibilityReceivedOrRejected =
    feasibility?.decision === "ADMISSIBLE" ||
    feasibility?.decision === "REJECTED";

  const isEligibilityRequirementPartial =
    dematerializedFeasibilityFile?.eligibilityRequirement ===
    "PARTIAL_ELIGIBILITY_REQUIREMENT";

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
        HasBeenSentComponent={
          <DecisionSentComponent
            decisionSentAt={feasibility?.decisionSentAt as any as Date}
            decision={feasibility?.decision as FeasibilityDecision}
            decisionComment={feasibility?.decisionComment}
            history={feasibility?.history}
          />
        }
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
              dematerializedFeasibilityFile?.eligibilityValidUntil as any as Date | null
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
          <PrerequisitesCard
            prerequisites={
              dematerializedFeasibilityFile?.prerequisites as Prerequisite[]
            }
            prerequisitesPartComplete={
              dematerializedFeasibilityFile?.prerequisitesPartComplete
            }
            disabled={!dematerializedFeasibilityFile?.certificationPartComplete}
            isEditable={isFeasibilityEditable}
          />
          <DecisionCard
            aapDecision={
              dematerializedFeasibilityFile?.aapDecision as DfFileAapDecision | null
            }
            aapDecisionComment={
              dematerializedFeasibilityFile?.aapDecisionComment as string | null
            }
            isEditable={isFeasibilityEditable}
            disabled={isEligibilityRequirementPartial}
          />
          <AttachmentsCard
            attachmentsPartComplete={
              dematerializedFeasibilityFile?.attachmentsPartComplete
            }
            isEditable={isFeasibilityEditable}
            attachments={
              dematerializedFeasibilityFile?.attachments as DffAttachment[]
            }
          />
          <hr />

          <h2>Récapitulatif et envoi du dossier au candidat</h2>

          <SendFileCandidateSection
            sentToCandidateAt={
              dematerializedFeasibilityFile?.sentToCandidateAt as Date | null
            }
            isReadyToBeSentToCandidate={
              dematerializedFeasibilityFile?.isReadyToBeSentToCandidate
            }
          />
          {dematerializedFeasibilityFile?.candidateDecisionComment && (
            <CandidateDecisionCommentCard
              candidateDecisionComment={
                dematerializedFeasibilityFile.candidateDecisionComment as string
              }
            />
          )}
          <SwornStatementCard
            sentToCandidateAt={
              dematerializedFeasibilityFile?.sentToCandidateAt as Date | null
            }
            swornStatementFileId={
              dematerializedFeasibilityFile?.swornStatementFileId
            }
            isEditable={isFeasibilityEditable}
          />

          <hr className="pb-0.5" />

          <SendFileCertificationAuthoritySection
            sentToCertificationAuthorityAt={
              feasibilityFileSentAt as any as Date | null
            }
            isReadyToBeSentToCertificationAuthority={
              dematerializedFeasibilityFile?.isReadyToBeSentToCertificationAuthority
            }
            decisionSentAt={feasibility?.decisionSentAt as any as Date}
            decision={feasibility?.decision as FeasibilityDecision}
            decisionComment={feasibility?.decisionComment}
            history={feasibility?.history}
          />
        </ul>
      )}
    </div>
  );
};

export default AapFeasibilityPage;
