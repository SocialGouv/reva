import { CandidacyStatusStep } from "@/graphql/generated/graphql";

import { isCandidacyStatusEqualOrAbove } from "./isCandidacyStatusEqualOrAbove";

export const isCandidacyPaymentRequestAlreadySent = ({
  isFundingAndPaymentRequestsFromCandidacyStatusesRemoved,
  candidacy,
}: {
  isFundingAndPaymentRequestsFromCandidacyStatusesRemoved: boolean;
  candidacy?: {
    isPaymentRequestSent: boolean;
    isPaymentRequestUnifvaeSent: boolean;
    status: CandidacyStatusStep;
  } | null;
}) =>
  !!(
    candidacy &&
    (isFundingAndPaymentRequestsFromCandidacyStatusesRemoved
      ? candidacy.isPaymentRequestSent || candidacy.isPaymentRequestUnifvaeSent
      : isCandidacyStatusEqualOrAbove(
          candidacy.status,
          "DEMANDE_PAIEMENT_ENVOYEE",
        ))
  );
