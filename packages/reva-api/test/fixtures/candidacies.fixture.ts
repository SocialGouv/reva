import {
  Candidacy,
  CandidacyStatusStep,
  CandidateTypology,
  FinanceModule,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { sub } from "date-fns";
import { CANDIDATE_MAN } from "./candidates.fixture";
import { EXPERT_FILIERE_ORGANISM } from "./organisms.fixture";

const CERTIFICATION_ID_1 = "51eef7ae-80c0-481b-946f-9d6e1b9fc70c";
const DATE_NOW = new Date();
const SIX_MONTHS_AGO = sub(DATE_NOW, { months: 6 });
const SIX_MONTHS_AGO_MINUS_ONE_MINUTE = sub(DATE_NOW, {
  months: 6,
  minutes: -1,
});

const CANDIDACY_BASE: Candidacy = {
  id: "00000000-0000-0000-0000-000000000000",
  organismId: EXPERT_FILIERE_ORGANISM.id,
  typology: CandidateTypology.BENEVOLE,
  typologyAdditional: null,
  ccnId: null,
  firstAppointmentOccuredAt: null,
  appointmentCount: 0,
  certificateSkills: null,
  otherTraining: null,
  individualHourCount: null,
  collectiveHourCount: null,
  additionalHourCount: null,
  candidateId: CANDIDATE_MAN.id,
  departmentId: null,
  reorientationReasonId: null,
  createdAt: DATE_NOW,
  updatedAt: null,
  financeModule: FinanceModule.unifvae,
  isCertificationPartial: false,
  readyForJuryEstimatedAt: null,
  reminderToOrganismDVDeadlineExceededSentAt: null,
  feasibilityFormat: "UPLOADED_PDF",
  certificationAuthorityTransferReason: null,
  certificationId: CERTIFICATION_ID_1,
  status: CandidacyStatusStep.PARCOURS_CONFIRME,
  typeAccompagnement: "ACCOMPAGNE",
  estimatedCost: new Decimal(0),
};

export const CANDIDACY_UNIFVAE: Candidacy = {
  ...CANDIDACY_BASE,
  id: "00000000-0000-0000-0000-000000000001",
  financeModule: FinanceModule.unifvae,
};

export const CANDIDACY_UNIREVA: Candidacy = {
  ...CANDIDACY_BASE,
  id: "00000000-0000-0000-0000-000000000002",
  financeModule: FinanceModule.unireva,
};

const CANDIDACY_DROP_OUT_BASE = {
  createdAt: DATE_NOW,
  status: CandidacyStatusStep.PARCOURS_CONFIRME,
  dropOutReasonId: undefined,
  otherReasonContent: null,
  proofReceivedByAdmin: false,
  validatedAt: null,
  updatedAt: null,
};

export const DROP_OUT_SIX_MONTHS_AGO = {
  ...CANDIDACY_DROP_OUT_BASE,
  createdAt: SIX_MONTHS_AGO,
};

export const DROP_OUT_SIX_MONTHS_AGO_MINUS_ONE_MINUTE = {
  ...CANDIDACY_DROP_OUT_BASE,
  createdAt: SIX_MONTHS_AGO_MINUS_ONE_MINUTE,
};
