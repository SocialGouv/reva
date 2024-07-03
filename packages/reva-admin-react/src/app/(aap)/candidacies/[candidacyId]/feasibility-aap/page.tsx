"use client";
import { useAapFeasibilityPageLogic } from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/aapFeasibilityPageLogic";
import CandidacySectionCard from "@/components/card/candidacy-section-card/CandidacySectionCard";
import {
  BadgeCompleted,
  BadgeToComplete,
  DefaultCandidacySectionCard,
} from "@/components/card/candidacy-section-card/DefaultCandidacySectionCard";
import {
  CompetenceBlocsPartCompletion,
  DfFileDecision,
  Prerequisite,
} from "@/graphql/generated/graphql";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";
import { useParams } from "next/navigation";
import { AttachmentsCard } from "./_components/AttachmentsCard";
import { DecisionCard } from "./_components/DecisionCard";
import { PrerequisitesCard } from "./_components/PrerequisitesCard";
import { SendFileCandidateSection } from "./_components/SendFileCandidateSection";
import { SendFileCertificationAuthoritySection } from "./_components/SendFileCertificateurSection";
import { SwornStatementCard } from "./_components/SwornStatementCard";
import { CertificationCompetenceAccordion } from "@/app/(aap)/candidacies/[candidacyId]/feasibility-aap/_components/DffSummary/_components/CertificationCompetenceAccordion";

const AapFeasibilityPage = () => {
  const { candidacyId } = useParams<{
    candidacyId: string;
  }>();

  const { certification, dematerializedFeasibilityFile, queryStatus } =
    useAapFeasibilityPageLogic();

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
            title="Descriptif de la certification"
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
            <p className="text-xs mb-0 text-dsfr-light-text-mention-grey">
              RNCP {certification?.codeRncp}
            </p>
          </DefaultCandidacySectionCard>
          <CandidacySectionCard
            title="Blocs de compétences"
            titleIconClass="fr-icon-survey-fill"
            badge={
              <CompetencesSectionBadge
                completion={
                  dematerializedFeasibilityFile?.competenceBlocsPartCompletion ||
                  "TO_COMPLETE"
                }
              />
            }
          >
            <ul className="list-none flex flex-col">
              {dematerializedFeasibilityFile?.blocsDeCompetences?.map(
                (bloc) => (
                  <li
                    key={bloc.certificationCompetenceBloc.id}
                    className="flex justify-between items-start pb-0 gap-6"
                  >
                    <CertificationCompetenceAccordion
                      key={bloc.certificationCompetenceBloc.id}
                      competenceBloc={bloc.certificationCompetenceBloc}
                      competenceDetails={
                        dematerializedFeasibilityFile?.certificationCompetenceDetails
                      }
                    />
                    <Button
                      className="w-[120px] mt-4 flex-none"
                      priority={bloc.complete ? "secondary" : "primary"}
                      linkProps={{
                        href: `/candidacies/${candidacyId}/feasibility-aap/competencies-blocks/${bloc.certificationCompetenceBloc.id}`,
                      }}
                    >
                      <span className="mx-auto">
                        {bloc.complete ? "Modifier" : "Compléter"}
                      </span>
                    </Button>
                  </li>
                ),
              )}
            </ul>
          </CandidacySectionCard>
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
              dematerializedFeasibilityFile?.aapDecision as DfFileDecision | null
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
              dematerializedFeasibilityFile?.sentToCertificationAuthorityAt as Date | null
            }
            isReadyToBeSentToCertificationAuthority={
              dematerializedFeasibilityFile?.isReadyToBeSentToCertificationAuthority
            }
          />
        </ul>
      )}
    </div>
  );
};

export default AapFeasibilityPage;

const CompetencesSectionBadge = ({
  completion,
}: {
  completion: CompetenceBlocsPartCompletion;
}) => {
  switch (completion) {
    case "COMPLETED":
      return <BadgeCompleted />;
    case "IN_PROGRESS":
      return <Badge severity="info">En cours</Badge>;
    default:
      return <BadgeToComplete />;
  }
};
