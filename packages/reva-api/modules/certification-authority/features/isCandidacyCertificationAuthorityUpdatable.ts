import { FeasibilityStatus } from "@prisma/client";

import { getActiveFeasibilityByCandidacyid } from "@/modules/feasibility/feasibility.features";

// Feasibility decisions past which the certification authority is already handling the candidacy.
export const FEASIBILITY_DECISIONS_LOCKING_CERTIFICATION_AUTHORITY: FeasibilityStatus[] =
  ["PENDING", "REJECTED", "ADMISSIBLE", "COMPLETE"];

export const isCandidacyCertificationAuthorityUpdatable = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const feasibility = await getActiveFeasibilityByCandidacyid({ candidacyId });

  let certificationAuthorityUpdatable = false;

  if (!feasibility) {
    certificationAuthorityUpdatable = true;
  } else {
    const feasibilityDecisionAsString = feasibility?.decision || "";

    certificationAuthorityUpdatable =
      !FEASIBILITY_DECISIONS_LOCKING_CERTIFICATION_AUTHORITY.includes(
        feasibilityDecisionAsString as FeasibilityStatus,
      );
  }

  return certificationAuthorityUpdatable;
};
