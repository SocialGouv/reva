import { generateAndUploadFeasibilityFileByCandidacyId } from "@/modules/feasibility/dematerialized-feasibility-file/features/generateAndUploadFeasibilityFileByCandidacyId";

import { prismaClient } from "../prisma/client";

const uploadAllDffFileForDematerializedFeasibility = async () => {
  const dematerializedFeasibilityFiles =
    await prismaClient.dematerializedFeasibilityFile.findMany({
      select: { feasibility: { select: { candidacyId: true } } },
    });

  console.log(
    `dematerializedFeasibilityFiles.length : ${dematerializedFeasibilityFiles.length}`,
  );

  let currentIndex = 0;

  for (const dematerializedFeasibilityFile of dematerializedFeasibilityFiles) {
    const candidacyId = dematerializedFeasibilityFile.feasibility.candidacyId;

    console.log(
      `Start processing dff generation at index ${currentIndex} with candidacyId : ${candidacyId}`,
    );

    try {
      await generateAndUploadFeasibilityFileByCandidacyId(candidacyId);
      // eslint-disable-next-line no-empty
    } catch (_error) {}

    console.log(
      `End processing dff generation at index ${currentIndex} with candidacyId : ${candidacyId}`,
    );

    currentIndex++;
  }
};

const main = async () => {
  await uploadAllDffFileForDematerializedFeasibility();
};

main();
