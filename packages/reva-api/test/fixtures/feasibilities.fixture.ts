import { randomUUID } from "crypto";

import {
  Feasibility,
  FeasibilityFormat,
  FeasibilityStatus,
} from "@prisma/client";

const FEASIBILITY_BASE: Feasibility = {
  id: randomUUID(),
  candidacyId: randomUUID(),
  certificationAuthorityId: null,
  decision: FeasibilityStatus.ADMISSIBLE,
  decisionComment: null,
  decisionFileId: null,
  decisionSentAt: null,
  feasibilityFileSentAt: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: null,
  feasibilityFormat: FeasibilityFormat.UPLOADED_PDF,
};

export const FEASIBILITY_ADMISSIBLE: Feasibility = {
  ...FEASIBILITY_BASE,
  id: randomUUID(),
};

export const FEASIBILITY_REJECTED: Feasibility = {
  ...FEASIBILITY_BASE,
  id: randomUUID(),
  decision: FeasibilityStatus.REJECTED,
};
