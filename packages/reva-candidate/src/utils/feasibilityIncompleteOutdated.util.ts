/**
 * Après une décision INCOMPLETE, les dates antérieures à la décision sont considérées comme "périmées".
 */

/**
 * Retourne vrai si sentToCandidateAt est antérieure à la décision INCOMPLETE
 * (c.-à-d. que l'AAP n'a pas encore re-envoyé après une décision INCOMPLETE).
 */
export const isSentToCandidateOutdatedAfterIncomplete = ({
  decision,
  decisionSentAt,
  sentToCandidateAt,
}: {
  decision?: string | null;
  decisionSentAt?: string | number | Date | null;
  sentToCandidateAt?: string | number | Date | null;
}): boolean =>
  decision === "INCOMPLETE" &&
  !!sentToCandidateAt &&
  !!decisionSentAt &&
  new Date(sentToCandidateAt) <= new Date(decisionSentAt);

/**
 * Retourne vrai si candidateConfirmationAt est postérieure à la décision INCOMPLETE
 * (candidat a re-confirmé après la décision INCOMPLETE).
 */
export const hasFreshCandidateConfirmation = ({
  decision,
  decisionSentAt,
  candidateConfirmationAt,
}: {
  decision?: string | null;
  decisionSentAt?: string | number | Date | null;
  candidateConfirmationAt?: string | number | Date | null;
}): boolean =>
  !!candidateConfirmationAt &&
  (!decisionSentAt ||
    decision !== "INCOMPLETE" ||
    new Date(candidateConfirmationAt) > new Date(decisionSentAt));
