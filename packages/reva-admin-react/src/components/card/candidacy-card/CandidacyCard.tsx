import Tag from "@codegouvfr/react-dsfr/Tag";
import { format, isAfter } from "date-fns";
import { useRouter } from "next/navigation";

import { WhiteCard } from "@/components/card/white-card/WhiteCard";

import {
  CandidacyStatusStep,
  FeasibilityDecision,
  JuryResult,
  OrganismModaliteAccompagnement,
} from "@/graphql/generated/graphql";

type Feasibility = {
  dematerializedFeasibilityFile?: {
    sentToCandidateAt?: number | null;
    isReadyToBeSentToCertificationAuthority: boolean;
    isReadyToBeSentToCandidate: boolean;
    candidateConfirmationAt?: number | null;
    swornStatementFileId?: string | null;
  } | null;
  decision?: FeasibilityDecision | null;
  feasibilityFileSentAt?: number | null;
} | null;

type Jury = {
  dateOfSession: number;
  result?: JuryResult | null;
} | null;

type Dropout = {
  createdAt: number;
} | null;

const StatusTag = ({
  status,
  feasibility,
  jury,
  dropout,
}: {
  status: CandidacyStatusStep;
  feasibility?: Feasibility;
  jury?: Jury;
  dropout?: Dropout;
}) => {
  const isSentToCandidate =
    !!feasibility?.dematerializedFeasibilityFile?.sentToCandidateAt;
  const hasCandidateConfirmed =
    !!feasibility?.dematerializedFeasibilityFile?.candidateConfirmationAt;
  const isJuryUpcoming = jury && isAfter(jury.dateOfSession, new Date());

  const resultIsSuccess =
    jury?.result === "FULL_SUCCESS_OF_FULL_CERTIFICATION" ||
    jury?.result === "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION";
  const resultIsPartialSuccess =
    jury?.result === "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION" ||
    jury?.result === "PARTIAL_SUCCESS_PENDING_CONFIRMATION" ||
    jury?.result === "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION";

  switch (true) {
    case status === "ARCHIVE":
      return <Tag small>Candidature supprimée</Tag>;
    case !!dropout:
      return <Tag small>Candidature abandonnée</Tag>;
    case status === "PROJET":
      return <Tag small>Projet en cours d'édition</Tag>;
    case status === "VALIDATION":
      return <Tag small>Nouvelle candidature</Tag>;
    case status === "PRISE_EN_CHARGE":
      return <Tag small>Candidature prise en charge</Tag>;
    case status === "PARCOURS_ENVOYE":
      return <Tag small>Parcours envoyé</Tag>;
    case status === "PARCOURS_CONFIRME":
      return <Tag small>Parcours confirmé par le candidat</Tag>;
    case isSentToCandidate &&
      !hasCandidateConfirmed &&
      feasibility.decision === "DRAFT":
      return <Tag small>Dossier de faisabilité envoyé au candidat</Tag>;
    case isSentToCandidate &&
      hasCandidateConfirmed &&
      feasibility.decision === "DRAFT":
      return <Tag small>Dossier de faisabilité confirmé par le candidat</Tag>;
    case status === "DOSSIER_FAISABILITE_ENVOYE":
      return <Tag small>Dossier de faisabilité envoyé au certificateur</Tag>;
    case status === "DOSSIER_FAISABILITE_INCOMPLET":
      return <Tag small>Dossier de faisabilité incomplet</Tag>;
    case status === "DOSSIER_FAISABILITE_RECEVABLE":
      return <Tag small>Recevable</Tag>;
    case status === "DOSSIER_FAISABILITE_NON_RECEVABLE":
      return <Tag small>Non recevable</Tag>;
    case status === "DOSSIER_DE_VALIDATION_ENVOYE" && !jury:
      return <Tag small>Dossier de validation envoyé</Tag>;
    case status === "DOSSIER_DE_VALIDATION_SIGNALE":
      return <Tag small>Dossier de validation signalé</Tag>;
    case isJuryUpcoming:
      return <Tag small>Jury programmé</Tag>;
    case jury && !isJuryUpcoming && !jury.result:
      return <Tag small>En attente de résultat</Tag>;
    case resultIsPartialSuccess:
      return <Tag small>Réussite partielle</Tag>;
    case resultIsSuccess:
      return <Tag small>Réussite totale</Tag>;
    default:
      return null;
  }
};

export const CandidacyCard = ({
  candidacyId,
  candidateFirstname,
  candidateFirstname2,
  candidateFirstname3,
  candidateLastname,
  candidateGivenName,
  certificationLabel,
  departmentLabel,
  departmentCode,
  organismLabel,
  organismModalitateAccompagnement,
  candidacySentAt,
  fundable,
  vaeCollective,
  vaeCollectiveCommanditaireLabel,
  vaeCollectiveProjetLabel,
  vaeCollectiveCohortLabel,
  status,
  feasibility,
  jury,
  dropout,
}: {
  candidacyId: string;
  candidateFirstname: string;
  candidateFirstname2?: string;
  candidateFirstname3?: string;
  candidateLastname: string;
  candidateGivenName?: string;
  certificationLabel?: string;
  departmentLabel?: string;
  departmentCode?: string;
  organismLabel?: string;
  organismModalitateAccompagnement?: OrganismModaliteAccompagnement;
  candidacySentAt?: Date;
  fundable: boolean;
  vaeCollective?: boolean;
  vaeCollectiveCommanditaireLabel?: string;
  vaeCollectiveProjetLabel?: string;
  vaeCollectiveCohortLabel?: string;
  status: CandidacyStatusStep;
  feasibility?: Feasibility;
  jury?: Jury;
  dropout?: Dropout;
}) => {
  const router = useRouter();

  return (
    <WhiteCard
      key={candidacyId}
      className="gap-3 fr-card--shadow hover:bg-dsfr-light-neutral-grey-1000 cursor-pointer"
      onClick={() => {
        router.push(`/candidacies/${candidacyId}/summary`);
      }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          {organismModalitateAccompagnement == "A_DISTANCE" && (
            <Tag small iconId="fr-icon-headphone-fill">
              À distance
            </Tag>
          )}
          {organismModalitateAccompagnement == "LIEU_ACCUEIL" && (
            <Tag small iconId="fr-icon-home-4-fill">
              Sur site
            </Tag>
          )}
          <Tag small>
            {fundable ? "Finançable France VAE" : "Financement droit commun"}
          </Tag>
          {vaeCollective && <Tag small>VAE collective</Tag>}
          <StatusTag
            status={status}
            jury={jury}
            feasibility={feasibility}
            dropout={dropout}
          />
        </div>

        {departmentLabel && departmentCode && (
          <div className="text-xs text-dsfrGray-mentionGrey">{`${departmentLabel} (${departmentCode})`}</div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="font-bold text-xl text-dsfr-blue-france-sun-113">
          {candidateGivenName
            ? `${candidateGivenName} (${candidateLastname})`
            : candidateLastname}{" "}
          {candidateFirstname}
          {candidateFirstname2 && <span>, {candidateFirstname2}</span>}
          {candidateFirstname3 && <span>, {candidateFirstname3}</span>}
        </div>

        <p className="m-0 text-sm">
          {certificationLabel && (
            <span>
              {certificationLabel}
              <br />
            </span>
          )}

          {organismLabel && (
            <span>
              {organismLabel}
              <br />
            </span>
          )}

          {vaeCollectiveCommanditaireLabel && vaeCollectiveProjetLabel && (
            <span>
              {`${vaeCollectiveCommanditaireLabel} - ${vaeCollectiveProjetLabel}`}
              <br />
            </span>
          )}

          {vaeCollectiveCohortLabel && <span>{vaeCollectiveCohortLabel}</span>}
        </p>
      </div>

      <div className="flex flex-row gap-2 justify-between">
        <div className="text-xs text-dsfrGray-mentionGrey">
          {!!candidacySentAt &&
            `Envoyée le ${format(candidacySentAt, "dd MMMM yyyy")}`}
        </div>

        <span
          className="fr-icon--sm fr-icon-arrow-right-line text-dsfr-blue-france-sun-113"
          aria-hidden="true"
        ></span>
      </div>
    </WhiteCard>
  );
};
