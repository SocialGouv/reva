import { CandidacyStatusStep } from "@/graphql/generated/graphql";

export const isCandidacyPaymentRequestAlreadySent = ({
  candidacy,
}: {
  candidacy?: {
    isPaymentRequestSent: boolean;
    isPaymentRequestUnifvaeSent: boolean;
    status: CandidacyStatusStep;
  } | null;
}) =>
  !!(
    candidacy &&
    (candidacy.isPaymentRequestSent || candidacy.isPaymentRequestUnifvaeSent)
  );
