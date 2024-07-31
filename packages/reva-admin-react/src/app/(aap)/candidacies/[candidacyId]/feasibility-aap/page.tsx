"use client";
import { useAapFeasibilityPageLogic } from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/aapFeasibilityPageLogic";
import { DefaultCandidacySectionCard } from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import {
  CertificationCompetenceDetails,
  DfFileAapDecision,
  DffCertificationCompetenceBloc,
  FeasibilityDecision,
  Prerequisite,
} from "@/graphql/generated/graphql";
import { useParams } from "next/navigation";
import { AttachmentsCard } from "./_components/AttachmentsCard";
import { CompetenciesBlocksSection } from "./_components/CompetenciesBlocksSection";
import { DecisionCard } from "./_components/DecisionCard";
import { PrerequisitesCard } from "./_components/PrerequisitesCard";
import { SendFileCandidateSection } from "./_components/SendFileCandidateSection";
import { SendFileCertificationAuthoritySection } from "./_components/SendFileCertificateurSection";
import { SwornStatementCard } from "./_components/SwornStatementCard";

const AapFeasibilityPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const {
    certification,
    dematerializedFeasibilityFile,
    queryStatus,
    feasibility,
    isCertificationPartial,
  } = useAapFeasibilityPageLogic();

  const feasibilityFileSentAt = feasibility?.feasibilityFileSentAt;

  return (
    <div className="flex flex-col">
      <h1>Dossier de faisabilité</h1>
      <p>
        Remplissez toutes les catégories afin de pouvoir envoyer le dossier au
        certificateur.
      </p>
      {queryStatus === "success" && (
        <ul className="flex flex-col gap-8">
          <DefaultCandidacySectionCard
            title="Certification visée"
            titleIconClass="fr-icon-award-fill"
            isEditable
            status={
              dematerializedFeasibilityFile?.certificationPartComplete
                ? "COMPLETED"
                : "TO_COMPLETE"
            }
            buttonOnClickHref={`/candidacies/${candidacyId}/feasibility-aap/certification`}
          >
            <p className="text-xl font-bold mb-2">{certification?.label}</p>
            <p className="text-xs mb-2 text-dsfr-light-text-mention-grey">
              RNCP {certification?.codeRncp}
            </p>
            {dematerializedFeasibilityFile?.option && (
              <p>
                Option du parcours :{" "}
                <span className="block font-medium">
                  {dematerializedFeasibilityFile?.option}
                </span>
              </p>
            )}
            <div className="flex flew-col gap-12">
              {dematerializedFeasibilityFile?.firstForeignLanguage && (
                <p>
                  Langue vivante 1 :{" "}
                  <span className="block font-medium">
                    {dematerializedFeasibilityFile?.firstForeignLanguage}
                  </span>
                </p>
              )}
              {dematerializedFeasibilityFile?.secondForeignLanguage && (
                <p>
                  Langue vivante 2 :{" "}
                  <span className="block font-medium">
                    {dematerializedFeasibilityFile?.secondForeignLanguage}
                  </span>
                </p>
              )}
            </div>
            <p className="mb-0">
            {isCertificationPartial
          ? "Un ou plusieurs bloc(s) de compétences visé(s)"
          : "La certification dans sa totalité"}
            </p>
          </DefaultCandidacySectionCard>
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
          />
          <PrerequisitesCard
            prerequisites={
              dematerializedFeasibilityFile?.prerequisites as Prerequisite[]
            }
            prerequisitesPartComplete={
              dematerializedFeasibilityFile?.prerequisitesPartComplete
            }
          />
          <DecisionCard
            aapDecision={
              dematerializedFeasibilityFile?.aapDecision as DfFileAapDecision | null
            }
            aapDecisionComment={
              dematerializedFeasibilityFile?.aapDecisionComment as string | null
            }
          />
          <AttachmentsCard
            attachmentsPartComplete={
              dematerializedFeasibilityFile?.attachmentsPartComplete
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
          <SwornStatementCard
            sentToCandidateAt={
              dematerializedFeasibilityFile?.sentToCandidateAt as Date | null
            }
            swornStatementFileId={
              dematerializedFeasibilityFile?.swornStatementFileId
            }
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
          />
        </ul>
      )}
    </div>
  );
};

export default AapFeasibilityPage;
