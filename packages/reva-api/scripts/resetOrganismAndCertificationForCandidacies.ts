import { prismaClient } from "../prisma/client";

const resetOrganismAndCertificationForCandidacies = async () => {
  const candidacyStatuses = await prismaClient.candidaciesStatus.findMany({
    where: {
      isActive: true,
      status: "PROJET",
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
};

const main = async () => {
  await resetOrganismAndCertificationForCandidacies();
};

main();
