import Tag from "@codegouvfr/react-dsfr/Tag";
import { isAfter } from "date-fns";

import { CandidacyStatusStep, JuryResult } from "@/graphql/generated/graphql";

export type JuryCandidacyStatus = {
  dateOfSession: number;
  result?: JuryResult | null;
} | null;

export type DropoutCandidacyStatus = {
  createdAt: number;
} | null;

export const CandidacyStatusTag = ({
  status,
  jury,
  dropout,
}: {
  status: CandidacyStatusStep;
  jury?: JuryCandidacyStatus | null;
  dropout?: DropoutCandidacyStatus;
}) => {
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
      return <Tag small>Dossier supprimé</Tag>;
    case !!dropout:
      return <Tag small>Dossier abandonné</Tag>;
    case status === "DOSSIER_FAISABILITE_ENVOYE":
      return <Tag small>Nouveau dossier de faisabilité</Tag>;
    case status === "DOSSIER_FAISABILITE_COMPLET":
      return <Tag small>En attente de recevabilité</Tag>;
    case status === "DOSSIER_FAISABILITE_INCOMPLET":
      return <Tag small>Dossier de faisabilité incomplet</Tag>;
    case status === "DOSSIER_FAISABILITE_RECEVABLE":
      return <Tag small>Recevable</Tag>;
    case status === "DOSSIER_FAISABILITE_NON_RECEVABLE":
      return <Tag small>Non recevable</Tag>;
    case status === "DOSSIER_DE_VALIDATION_ENVOYE" && !jury:
      return <Tag small>Dossier de validation reçu</Tag>;
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
