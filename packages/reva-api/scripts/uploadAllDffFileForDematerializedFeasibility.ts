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

  const errorOnCandidacyIds: { candidacyId: string; errorStr: any }[] = [];

  for (const dematerializedFeasibilityFile of dematerializedFeasibilityFiles) {
    const candidacyId = dematerializedFeasibilityFile.feasibility.candidacyId;

    console.log(
      `Start processing dff generation at index ${currentIndex} with candidacyId : ${candidacyId}`,
    );

    try {
      await generateAndUploadFeasibilityFileByCandidacyId(candidacyId);
    } catch (error) {
      const errorStr = error?.toString();
      if (
        errorStr?.indexOf(
          "Dossier de faisabilité incomplet pour la génération du pdf",
        ) == -1
      ) {
        errorOnCandidacyIds.push({ candidacyId, errorStr });
      }
    }

    console.log(
      `End processing dff generation at index ${currentIndex} with candidacyId : ${candidacyId}`,
    );

    currentIndex++;
  }

  console.log(`Logging errors`);
  console.log(`errors.length ${errorOnCandidacyIds.length}`);

  for (const error of errorOnCandidacyIds) {
    console.log(error.candidacyId);
    console.log(error.errorStr);
    console.log("");
  }
};

const main = async () => {
  await uploadAllDffFileForDematerializedFeasibility();
};

main();
