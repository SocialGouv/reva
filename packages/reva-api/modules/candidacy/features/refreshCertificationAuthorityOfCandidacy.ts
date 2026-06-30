import {
  getActiveFeasibilityByCandidacyid,
  getCertificationAuthorities,
} from "@/modules/feasibility/feasibility.features";
import { prismaClient } from "@/prisma/client";

import { getCandidacy } from "./getCandidacy";

// Refresh the certification authority of a candidacy.
// Take the certification authority mapped to the certification of the candidacy and the department of the candidate and update it in the candidacy
// Only refresh if the feasibility decision is not PENDING, REJECTED, ADMISSIBLE or COMPLETE.
// Only set a certification authority if there is only one certification authority available. Set it to null if there is no certification authority available or many.
// IE do not update it while it's in the certification authority hands
export const refreshCertificationAuthorityOfCandidacy = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacy = await getCandidacy({ candidacyId });
  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const feasibility = await getActiveFeasibilityByCandidacyid({ candidacyId });

  const feasibilityDecisionAsString = feasibility?.decision || "";

  const certificationAuthorityUpdatable = ![
    "PENDING",
    "REJECTED",
    "ADMISSIBLE",
    "COMPLETE",
  ].includes(feasibilityDecisionAsString);

  if (certificationAuthorityUpdatable) {
    let newCertificationAuthority = null;
    const certificationAuthorities = await getCertificationAuthorities({
      candidacyId,
    });
    if (certificationAuthorities.length === 1) {
      newCertificationAuthority = certificationAuthorities[0];
    }

    await prismaClient.candidacy.update({
      where: { id: candidacyId },
      data: {
        certificationAuthorityId: newCertificationAuthority?.id ?? null,
      },
    });
  }
};
