/**
 * Après une décision INCOMPLETE, les dates antérieures à la décision sont considérées comme "périmées".
 * Retourne vrai si sentToCandidateAt est antérieure à la décision INCOMPLETE (l'AAP n'a pas encore ré-envoyé).
 */
export const isSentToCandidateOutdatedAfterIncomplete = ({
  isIncomplete,
  decisionSentAt,
  sentToCandidateAt,
}: {
  isIncomplete?: boolean;
  decisionSentAt?: Date | null;
  sentToCandidateAt?: Date | null;
}): boolean =>
  !!isIncomplete &&
  !!sentToCandidateAt &&
  !!decisionSentAt &&
  sentToCandidateAt <= decisionSentAt;
