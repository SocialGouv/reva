import { refreshCertificationAuthorityOfCandidacy } from "@/modules/certification-authority/features/refreshCertificationAuthorityOfCandidacy";
import { prismaClient } from "@/prisma/client";

const refreshCandidacyCertificationAuthorityId = async () => {
  const candidacies = await prismaClient.candidacy.findMany({
    where: { certificationAuthorityId: null },
    select: {
      id: true,
      Feasibility: {
        where: {
          isActive: true,
          decision: { in: ["PENDING", "REJECTED", "ADMISSIBLE", "COMPLETE"] },
        },
        select: { certificationAuthorityId: true },
      },
    },
  });

  console.log(
    `Found ${candidacies.length} candidacies without a certification authority.`,
  );

  for (const { id: candidacyId, Feasibility: feasibilities } of candidacies) {
    const activeFeasibilityCertificationAuthorityId =
      feasibilities[0]?.certificationAuthorityId;

    try {
      if (activeFeasibilityCertificationAuthorityId) {
        // Feasibility already sent to/decided by a certification authority: use that
        // authoritative value directly instead of recomputing from current data.
        await prismaClient.candidacy.update({
          where: { id: candidacyId },
          data: {
            certificationAuthorityId: activeFeasibilityCertificationAuthorityId,
          },
        });
      } else {
        await refreshCertificationAuthorityOfCandidacy({ candidacyId });
      }
    } catch (error) {
      console.log(`Error refreshing candidacy ${candidacyId}:`, error);
    }
  }

  console.log("Done.");
};

const main = async () => {
  await refreshCandidacyCertificationAuthorityId();
};

main();
