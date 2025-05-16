import { prismaClient } from "../prisma/client";

const resetOrganismAndCertificationForCandidacies = async () => {
  const candidacies = await prismaClient.candidacy.findMany({
    where: {
      status: "PROJET",
    },
  });

  const candidacyIds = candidacies.map(({ id }) => id);

  for (const candidacyId of candidacyIds) {
    await prismaClient.candidacy.update({
      where: { id: candidacyId },
      data: { organismId: null, certificationId: null },
    });
  }
};

const main = async () => {
  await resetOrganismAndCertificationForCandidacies();
};

main();
