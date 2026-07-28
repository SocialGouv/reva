import { prismaClient } from "@/prisma/client";

import { FEASIBILITY_DECISIONS_LOCKING_CERTIFICATION_AUTHORITY } from "./isCandidacyCertificationAuthorityUpdatable";

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
    select: {
      id: true,
      certificationId: true,
      candidate: { select: { departmentId: true } },
    },
  });

  // Resolve, once per distinct (certificationId, departmentId) pair rather
  // than once per candidacy, which single certification authority (if any)
  // covers it.
  const pairs = new Map<
    string,
    { certificationId: string; departmentId: string }
  >();
  for (const { certificationId, candidate } of candidacies) {
    if (!certificationId || !candidate?.departmentId) continue;
    pairs.set(`${certificationId}|${candidate.departmentId}`, {
      certificationId,
      departmentId: candidate.departmentId,
    });
  }

  const resolvedAuthorityIdByPairKey = new Map<string, string | null>();
  await Promise.all(
    [...pairs.entries()].map(
      async ([key, { certificationId, departmentId }]) => {
        const matchingAuthorities =
          await prismaClient.certificationAuthority.findMany({
            where: {
              certificationAuthorityOnDepartment: { some: { departmentId } },
              certificationAuthorityOnCertification: {
                some: { certificationId },
              },
            },
            select: { id: true },
          });
        resolvedAuthorityIdByPairKey.set(
          key,
          matchingAuthorities.length === 1 ? matchingAuthorities[0].id : null,
        );
      },
    ),
  );

  // Group candidacies by their resolved certification authority so each
  // group can be updated in a single query.
  const candidacyIdsByResolvedAuthorityId = new Map<string | null, string[]>();
  for (const { id, certificationId, candidate } of candidacies) {
    const resolvedAuthorityId =
      certificationId && candidate?.departmentId
        ? (resolvedAuthorityIdByPairKey.get(
            `${certificationId}|${candidate.departmentId}`,
          ) ?? null)
        : null;

    const group = candidacyIdsByResolvedAuthorityId.get(resolvedAuthorityId);
    if (group) {
      group.push(id);
    } else {
      candidacyIdsByResolvedAuthorityId.set(resolvedAuthorityId, [id]);
    }
  }

  await Promise.all(
    [...candidacyIdsByResolvedAuthorityId.entries()].map(
      ([resolvedAuthorityId, candidacyIds]) =>
        prismaClient.candidacy.updateMany({
          where: { id: { in: candidacyIds } },
          data: { certificationAuthorityId: resolvedAuthorityId },
        }),
    ),
  );
};
