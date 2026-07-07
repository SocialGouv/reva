import { refreshCertificationAuthorityOfCandidacy } from "@/modules/candidacy/features/refreshCertificationAuthorityOfCandidacy";
import { prismaClient } from "@/prisma/client";

import { FEASIBILITY_DECISIONS_LOCKING_CERTIFICATION_AUTHORITY } from "./isCandidacyCertificationAuthorityUpdatable";

// Assign a certification authority to previously-unassigned candidacies whose
// certification and department now fall within its coverage.
// Never touches candidacies that already have a certification authority, or
// whose active feasibility decision means the certification authority is
// already handling them (same rule as isCandidacyCertificationAuthorityUpdatable).
export const refreshCertificationAuthorityOfCandidacies = async ({
  certificationIds,
  departmentIds,
}: {
  certificationIds: string[];
  departmentIds: string[];
}) => {
  const candidacies = await prismaClient.candidacy.findMany({
    where: {
      certificationAuthorityId: null,
      certificationId: { in: certificationIds },
      candidate: { departmentId: { in: departmentIds } },
      Feasibility: {
        none: {
          isActive: true,
          decision: {
            in: FEASIBILITY_DECISIONS_LOCKING_CERTIFICATION_AUTHORITY,
          },
        },
      },
    },
    select: { id: true },
  });

  for (const { id: candidacyId } of candidacies) {
    await refreshCertificationAuthorityOfCandidacy({ candidacyId });
  }
};
