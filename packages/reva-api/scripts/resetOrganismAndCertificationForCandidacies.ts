import { prismaClient } from "../prisma/client";

const resetOrganismAndCertificationForCandidacies = async () => {
  // Get last version of Professional CGU
  const lastProfessional = await prismaClient.professionalCgu.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!lastProfessional) {
    return;
  }

  // Get all organisms where cgu version of MaisonMere not equal to last version of Professional CGU
  const organisms = await prismaClient.organism.findMany({
    where: {
      maisonMereAAP: {
        OR: [
          {
            cguVersion: { equals: null },
          },
          {
            cguVersion: { not: lastProfessional.version },
          },
        ],
      },
    },
  });

  // Clean all candidacies for retrived organisms
  for (const organism of organisms) {
    const candidacyStatuses = await prismaClient.candidaciesStatus.findMany({
      where: {
        isActive: true,
        status: "PROJET",
        candidacy: { organismId: organism.id },
      },
    });

    for (const candidacyStatus of candidacyStatuses) {
      const { candidacyId } = candidacyStatus;

      await prismaClient.candidaciesOnRegionsAndCertifications.deleteMany({
        where: { candidacyId },
      });

      await prismaClient.candidacy.update({
        where: { id: candidacyId },
        data: { organismId: null },
      });
    }
  }
};

const main = async () => {
  await resetOrganismAndCertificationForCandidacies();
};

main();
