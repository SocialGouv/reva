"use client";

import { toDate } from "date-fns";
import { redirect, usePathname } from "next/navigation";

import { useAapFeasibilityPageLogic } from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/aapFeasibilityPageLogic";
import { DecisionSentComponent } from "@/components/alert-decision-sent-feasibility/DecisionSentComponent";
import { DffSummary } from "@/components/dff-summary/DffSummary";

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

import { AttachmentsSection } from "./_components/AttachmentsSection";
import { CandidateDecisionCommentSection } from "./_components/CandidateDecisionCommentSection";
import { CertificationSection } from "./_components/CertificationSection";
import { CompetenciesBlocksSection } from "./_components/CompetenciesBlocksSection";
import { DecisionIncompleteAlert } from "./_components/DecisionIncompleteAlert";
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
}: {
  decisionSentAt: number | null | undefined;
  decision: FeasibilityDecision;
  decisionComment?: string | null;
  history?: FeasibilityHistory[];
}) => (
  <DecisionSentComponent
    decisionSentAt={decisionSentAt ? toDate(decisionSentAt) : null}
    decision={decision}
    decisionComment={decisionComment}
    history={history}
  />
);
const AapFeasibilityPage = () => {
  const {
    certification,
    dematerializedFeasibilityFile,
    queryStatus,
    feasibility,
    isCertificationPartial,
    candidacy,
  } = useAapFeasibilityPageLogic();
  const currentPath = usePathname();

  const feasibilityFileSentAt = feasibility?.feasibilityFileSentAt;
  const decision = feasibility?.decision;
  const decisionSentAt = feasibility?.decisionSentAt;
  const decisionComment = feasibility?.decisionComment;
  const history = feasibility?.history;
  const feasibilityDecisionIsIncomplete = decision === "INCOMPLETE";
  const isFeasibilityEditable =
    !feasibilityFileSentAt || feasibilityDecisionIsIncomplete;
  const isFeasibilityReceivedOrRejected =
    decision === "ADMISSIBLE" || decision === "REJECTED";
  const displayDecisionIncompleteAlert =
    feasibilityDecisionIsIncomplete && decisionSentAt;

  const isEligibilityRequirementPartial =
    dematerializedFeasibilityFile?.eligibilityRequirement ===
    "PARTIAL_ELIGIBILITY_REQUIREMENT";

  const aapIsWaitingForDecision =
    decision === "PENDING" || decision === "COMPLETE";

  if (!feasibility) {
    return null;
  }

  if (aapIsWaitingForDecision) {
    return redirect(`${currentPath}/send-file-certification-authority`);
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
            decisionSentAt={decisionSentAt}
            decision={decision as FeasibilityDecision}
            decisionComment={decisionComment}
            history={history}
          />
        }
        certificationAuthorityLabel={
          candidacy?.feasibility?.certificationAuthority?.label
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
      {displayDecisionIncompleteAlert && (
        <DecisionIncompleteAlert
          decisionSentAt={decisionSentAt}
          decisionComment={decisionComment || ""}
          history={history || []}
        />
      )}
      {queryStatus === "success" && (
        <ul className="flex flex-col gap-8">
          <EligibilitySection
            eligibilityRequirement={
              dematerializedFeasibilityFile?.eligibilityRequirement
            }
            eligibilityValidUntil={
              dematerializedFeasibilityFile?.eligibilityValidUntil
                ? toDate(dematerializedFeasibilityFile?.eligibilityValidUntil)
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
                : "Vous devez d'abord détailler la certification visée avant d'intégrer les blocs de compétences."
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

          <hr className="pb-0.5" />

          <SendFileCandidateSection
            sentToCandidateAt={
              dematerializedFeasibilityFile?.sentToCandidateAt as Date | null
            }
            isReadyToBeSentToCandidate={
              !!dematerializedFeasibilityFile?.isReadyToBeSentToCandidate
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
              feasibilityFileSentAt ? toDate(feasibilityFileSentAt) : null
            }
            isReadyToBeSentToCertificationAuthority={
              !!dematerializedFeasibilityFile?.isReadyToBeSentToCertificationAuthority
            }
          />
        </ul>
      )}
    </div>
  );
};

export default AapFeasibilityPage;
