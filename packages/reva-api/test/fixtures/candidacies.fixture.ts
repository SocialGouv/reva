import { CandidacyStatusStep } from "@prisma/client";
import { sub } from "date-fns";

const DATE_NOW = new Date();
const FOUR_MONTHS_AGO = sub(DATE_NOW, { months: 4 });
const FOUR_MONTHS_AGO_MINUS_FIVE_MINUTES = sub(DATE_NOW, {
  months: 4,
  minutes: -5,
});

const CANDIDACY_DROP_OUT_BASE = {
  createdAt: DATE_NOW,
  status: CandidacyStatusStep.PARCOURS_CONFIRME,
  dropOutReasonId: undefined,
  otherReasonContent: null,
  proofReceivedByAdmin: false,
  dropOutConfirmedByCandidate: false,
  validatedAt: null,
  updatedAt: null,
};

export const CANDIDACY_DROP_OUT_FOUR_MONTHS_AGO = {
  ...CANDIDACY_DROP_OUT_BASE,
  createdAt: FOUR_MONTHS_AGO,
};

export const CANDIDACY_DROP_OUT_FOUR_MONTHS_AGO_MINUS_FIVE_MINUTES = {
  ...CANDIDACY_DROP_OUT_BASE,
  createdAt: FOUR_MONTHS_AGO_MINUS_FIVE_MINUTES,
};
