import Tag from "@codegouvfr/react-dsfr/Tag";
import { isAfter, isBefore } from "date-fns";

import {
  CandidacyStatusStep,
  FeasibilityDecision,
  JuryResult,
  OrganismModaliteAccompagnement,
  TypeAccompagnement,
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
  firstAppointmentOccuredAt,
  feasibility,
  readyForJuryEstimatedAt,
  jury,
}: {
  status: CandidacyStatusStep;
  firstAppointmentOccuredAt?: Date;
  feasibility?: Feasibility;
  readyForJuryEstimatedAt?: Date;
  jury?: Jury;
}) => {
  const isFirstAppointmentUpcoming =
    firstAppointmentOccuredAt && isAfter(firstAppointmentOccuredAt, new Date());
  const isFirstAppointmentPast =
    firstAppointmentOccuredAt &&
    isBefore(firstAppointmentOccuredAt, new Date());

  const isSentToCandidate =
    !!feasibility?.dematerializedFeasibilityFile?.sentToCandidateAt;
  const hasCandidateConfirmed =
    !!feasibility?.dematerializedFeasibilityFile?.candidateConfirmationAt;

  const isReadyForJuryEstimatedAtUpcoming =
    readyForJuryEstimatedAt && isAfter(readyForJuryEstimatedAt, new Date());
  const isReadyForJuryEstimatedAtPast =
    readyForJuryEstimatedAt && isBefore(readyForJuryEstimatedAt, new Date());

  const isJuryUpcoming =
    jury && !jury.result && isAfter(jury.dateOfSession, new Date());

  const resultIsSuccess =
    jury?.result === "FULL_SUCCESS_OF_FULL_CERTIFICATION" ||
    jury?.result === "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION";
  const resultIsPartialSuccess =
    jury?.result === "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION" ||
    jury?.result === "PARTIAL_SUCCESS_PENDING_CONFIRMATION" ||
    jury?.result === "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION";
  const resultIsNotPresent =
    jury?.result === "CANDIDATE_ABSENT" || jury?.result === "CANDIDATE_EXCUSED";
  const resultIsFailure = jury?.result === "FAILURE";

  switch (true) {
    case status === "PROJET":
      return <Tag small>En brouillon</Tag>;
    case status === "VALIDATION":
      return <Tag small>Candidature envoyée</Tag>;
    case status === "PRISE_EN_CHARGE" && isFirstAppointmentUpcoming:
      return <Tag small>Rendez-vous pédagogique programmé</Tag>;
    case status === "PRISE_EN_CHARGE" && isFirstAppointmentPast:
      return <Tag small>En attente du parcours</Tag>;
    case status === "PRISE_EN_CHARGE":
      return <Tag small>Candidature prise en charge</Tag>;
    case status === "PARCOURS_ENVOYE":
      return <Tag small>Parcours reçu</Tag>;
    case status === "PARCOURS_CONFIRME":
      return <Tag small>Parcours validé</Tag>;
    case isSentToCandidate &&
      !hasCandidateConfirmed &&
      feasibility.decision === "DRAFT":
      return <Tag small>Dossier de faisabilité à valider</Tag>;
    case isSentToCandidate &&
      hasCandidateConfirmed &&
      feasibility.decision === "DRAFT":
      return <Tag small>Dossier de faisabilité validé</Tag>;
    case status === "DOSSIER_FAISABILITE_ENVOYE":
      return <Tag small>Dossier de faisabilité envoyé au certificateur</Tag>;
    case status === "DOSSIER_FAISABILITE_INCOMPLET":
      return <Tag small>Dossier de faisabilité incomplet</Tag>;
    case status === "DOSSIER_FAISABILITE_NON_RECEVABLE":
      return <Tag small>Non recevable</Tag>;
    case status === "DOSSIER_FAISABILITE_RECEVABLE" && !readyForJuryEstimatedAt:
      return <Tag small>Recevable / en attente de la date prévisonnelle</Tag>;
    case status === "DOSSIER_FAISABILITE_RECEVABLE" &&
      isReadyForJuryEstimatedAtUpcoming:
      return (
        <Tag small>
          Date prévisionnelle renseignée / en attente du dossier de validation
        </Tag>
      );
    case status === "DOSSIER_FAISABILITE_RECEVABLE" &&
      isReadyForJuryEstimatedAtPast:
      return (
        <Tag small>
          Date prévisionnelle dépassée / en attente du dossier de validation
        </Tag>
      );
    case status === "DOSSIER_DE_VALIDATION_ENVOYE" && !jury:
      return <Tag small>Dossier de validation envoyé / en attente du jury</Tag>;
    case status === "DOSSIER_DE_VALIDATION_SIGNALE":
      return <Tag small>Dossier de validation signalé</Tag>;
    case isJuryUpcoming:
      return <Tag small>Jury programmé</Tag>;
    case !!jury && !isJuryUpcoming && !jury.result:
      return <Tag small>Jury passé / Attente du résultat</Tag>;
    case resultIsPartialSuccess:
      return <Tag small>Réussite partielle</Tag>;
    case resultIsSuccess:
      return <Tag small>Réussite totale</Tag>;
    case resultIsNotPresent:
      return <Tag small>Non présentation au jury</Tag>;
    case resultIsFailure:
      return <Tag small>Non validation</Tag>;
    default:
      return null;
  }
};

export const CandidacyStatuses = ({
  currentStatus,
  previousStatus,
  typeAccompagnement,
  firstAppointmentOccuredAt,
  readyForJuryEstimatedAt,
  organismModalitateAccompagnement,
  vaeCollective,
  jury,
  feasibility,
  dropout,
}: {
  currentStatus: CandidacyStatusStep;
  previousStatus?: CandidacyStatusStep;
  typeAccompagnement: TypeAccompagnement;
  firstAppointmentOccuredAt?: Date;
  readyForJuryEstimatedAt?: Date;
  organismModalitateAccompagnement?: OrganismModaliteAccompagnement;
  vaeCollective?: boolean;
  jury?: Jury;
  feasibility?: Feasibility;
  dropout?: Dropout;
}) => {
  return (
    <>
      {typeAccompagnement == "AUTONOME" && <Tag small>Autonome</Tag>}

      {typeAccompagnement == "ACCOMPAGNE" && (
        <>
          {organismModalitateAccompagnement == "A_DISTANCE" && (
            <Tag small iconId="fr-icon-headphone-fill">
              Accompagnement à distance
            </Tag>
          )}

          {organismModalitateAccompagnement == "LIEU_ACCUEIL" && (
            <Tag small iconId="fr-icon-home-4-fill">
              Accompagnement sur site
            </Tag>
          )}
        </>
      )}

      {vaeCollective && <Tag small>VAE collective</Tag>}

      {currentStatus != "ARCHIVE" && (
        <StatusTag
          status={currentStatus}
          firstAppointmentOccuredAt={firstAppointmentOccuredAt}
          readyForJuryEstimatedAt={readyForJuryEstimatedAt}
          jury={jury}
          feasibility={feasibility}
        />
      )}

      {currentStatus === "ARCHIVE" && previousStatus && (
        <StatusTag
          status={previousStatus}
          firstAppointmentOccuredAt={firstAppointmentOccuredAt}
          readyForJuryEstimatedAt={readyForJuryEstimatedAt}
          jury={jury}
          feasibility={feasibility}
        />
      )}

      {!!dropout && <Tag small>Candidature abandonnée</Tag>}

      {currentStatus === "ARCHIVE" && <Tag small>Candidature archivée</Tag>}
    </>
  );
};
