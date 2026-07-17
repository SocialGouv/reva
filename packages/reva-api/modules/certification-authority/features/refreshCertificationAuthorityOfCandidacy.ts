import { getCandidacy } from "@/modules/candidacy/features/getCandidacy";
import { getCertificationAuthorities } from "@/modules/feasibility/feasibility.features";
import { CANDIDATURE_NON_TROUVEE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

import { isCandidacyCertificationAuthorityUpdatable } from "./isCandidacyCertificationAuthorityUpdatable";

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
    throw new Error(CANDIDATURE_NON_TROUVEE);
  }

  const certificationAuthorityUpdatable =
    await isCandidacyCertificationAuthorityUpdatable({
      candidacyId,
    });

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
