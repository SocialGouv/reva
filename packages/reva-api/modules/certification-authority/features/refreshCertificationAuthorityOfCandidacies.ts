import { prismaClient } from "@/prisma/client";

import { FEASIBILITY_DECISIONS_LOCKING_CERTIFICATION_AUTHORITY } from "./isCandidacyCertificationAuthorityUpdatable";
import { refreshCertificationAuthorityOfCandidacy } from "./refreshCertificationAuthorityOfCandidacy";

// Refresh the certification authority of candidacies affected by a change to a
// certification authority's covered certifications/departments:
// - assigns it to previously-unassigned candidacies now falling within its coverage.
// - removes it from candidacies currently mapped to it that no longer fall within its coverage.
// Never touches a candidacy whose active feasibility decision means the certification
// authority is already handling it (same rule as isCandidacyCertificationAuthorityUpdatable).
export const refreshCertificationAuthorityOfCandidacies = async ({
  updatedCertificationAuthorityId,
  certificationIds,
  departmentIds,
}: {
  updatedCertificationAuthorityId: string;
  certificationIds: string[];
  departmentIds: string[];
}) => {
  const candidacies = await prismaClient.candidacy.findMany({
    where: {
      Feasibility: {
        none: {
          isActive: true,
          decision: {
            in: FEASIBILITY_DECISIONS_LOCKING_CERTIFICATION_AUTHORITY,
          },
        },
      },
      OR: [
        {
          certificationAuthorityId: null,
          certificationId: { in: certificationIds },
          candidate: { departmentId: { in: departmentIds } },
        },
        { certificationAuthorityId: updatedCertificationAuthorityId },
      ],
    },
    select: { id: true },
  });

  for (const { id: candidacyId } of candidacies) {
    await refreshCertificationAuthorityOfCandidacy({ candidacyId });
  }
};
