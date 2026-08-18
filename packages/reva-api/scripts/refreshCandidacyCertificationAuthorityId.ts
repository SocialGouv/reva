import { FEASIBILITY_DECISIONS_LOCKING_CERTIFICATION_AUTHORITY } from "@/modules/certification-authority/features/isCandidacyCertificationAuthorityUpdatable";
import { refreshCertificationAuthorityOfCandidacy } from "@/modules/certification-authority/features/refreshCertificationAuthorityOfCandidacy";
import { prismaClient } from "@/prisma/client";

const BATCH_SIZE = 1000;

const refreshCandidacyCertificationAuthorityId = async () => {
  let processedCount = 0;
  let cursorId: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const candidacies = await prismaClient.candidacy.findMany({
      where: { certificationAuthorityId: null },
      orderBy: { id: "asc" },
      take: BATCH_SIZE,
      ...(cursorId && { cursor: { id: cursorId }, skip: 1 }),
      select: {
        id: true,
        Feasibility: {
          where: {
            isActive: true,
            decision: {
              in: FEASIBILITY_DECISIONS_LOCKING_CERTIFICATION_AUTHORITY,
            },
          },
          select: { certificationAuthorityId: true },
        },
      },
    });

    if (candidacies.length === 0) {
      hasMore = false;
      continue;
    }

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
              certificationAuthorityId:
                activeFeasibilityCertificationAuthorityId,
            },
          });
        } else {
          await refreshCertificationAuthorityOfCandidacy({ candidacyId });
        }
      } catch (error) {
        console.log(`Error refreshing candidacy ${candidacyId}:`, error);
      }
    }

    processedCount += candidacies.length;
    console.log(`Processed ${processedCount} candidacies so far.`);

    cursorId = candidacies[candidacies.length - 1].id;
  }

  console.log(
    `Done. Found ${processedCount} candidacies without a certification authority.`,
  );
};

const main = async () => {
  await refreshCandidacyCertificationAuthorityId();
};

main();
