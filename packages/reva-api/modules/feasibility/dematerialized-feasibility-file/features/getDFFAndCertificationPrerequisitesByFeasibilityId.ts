import { prismaClient } from "@/prisma/client";

export const getDFFAndCertificationPrerequisitesByFeasibilityId = async ({
  dematerializedFeasibilityFileId,
  feasibilityId,
}: {
  dematerializedFeasibilityFileId: string;
  feasibilityId: string;
}) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: {
      id: feasibilityId,
    },
    include: {
      candidacy: {
        include: {
          certification: true,
        },
      },
    },
  });

  const certification = feasibility?.candidacy?.certification;
  if (!certification) {
    throw new Error("Certification non trouvée");
  }
  const currentDffPrerequisites = await prismaClient.dFFPrerequisite.findMany({
    where: {
      dematerializedFeasibilityFileId,
    },
  });
  const currentDffCertificationPrerequisitesIds = currentDffPrerequisites
    .map((p) => p.certificationPrerequisiteId)
    .filter((id) => id !== null);

  const certificationPrerequisitesNotAlreadyInDff =
    await prismaClient.certificationPrerequisite.findMany({
      where: {
        certificationId: certification.id,
        id: { notIn: currentDffCertificationPrerequisitesIds },
      },
      select: {
        id: true,
        label: true,
        index: true,
      },
      orderBy: { index: "asc" },
    });

  const unifiedPrerequisites = [
    ...certificationPrerequisitesNotAlreadyInDff.map((p) => ({
      ...p,
      id: null,
      certificationPrerequisiteId: p.id,
    })),
    ...currentDffPrerequisites,
  ];
  return unifiedPrerequisites;
};
