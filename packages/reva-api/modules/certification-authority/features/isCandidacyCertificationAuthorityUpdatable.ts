import { getActiveFeasibilityByCandidacyid } from "@/modules/feasibility/feasibility.features";

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

    certificationAuthorityUpdatable = ![
      "PENDING",
      "REJECTED",
      "ADMISSIBLE",
      "COMPLETE",
    ].includes(feasibilityDecisionAsString);
  }

  return certificationAuthorityUpdatable;
};
