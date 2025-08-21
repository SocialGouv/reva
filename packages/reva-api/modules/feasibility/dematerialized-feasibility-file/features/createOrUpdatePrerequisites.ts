import { v4 as uuidv4 } from "uuid";

import { prismaClient } from "@/prisma/client";

import { DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput } from "../dematerialized-feasibility-file.types";

import { generateAndUploadFeasibilityFileByCandidacyId } from "./generateAndUploadFeasibilityFileByCandidacyId";
import { getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId } from "./getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId";
import { resetDFFSentToCandidateState } from "./resetDFFSentToCandidateState";

export const createOrUpdatePrerequisites = async ({
  candidacyId,
  input: { prerequisites },
}: {
  input: DematerializedFeasibilityFileCreateOrUpdatePrerequisitesInput;
  candidacyId: string;
}) => {
  const dFF =
    await getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId({
      candidacyId,
    });

  if (!dFF) {
    throw new Error("Dossier de faisabilité dématérialisé non trouvé");
  }

  if (dFF.prerequisitesPartComplete) {
    const existingIds = dFF.prerequisites.map((p) => p.id);
    const incomingIds = prerequisites.filter((p) => p.id).map((p) => p.id);
    const toDelete = dFF.prerequisites.filter(
      (p) => !incomingIds.includes(p.id),
    );
    const toCreate = prerequisites.filter((p) => !p.id);
    const toUpdate = prerequisites.filter(
      (p) => p.id && existingIds.includes(p.id),
    );

    // Assign new UUIDs to new prerequisites
    toCreate.forEach((prerequisite) => {
      prerequisite.id = uuidv4();
    });

    await prismaClient.dematerializedFeasibilityFile.update({
      where: { id: dFF.id },
      data: {
        prerequisites: {
          deleteMany: { id: { in: toDelete.map((p) => p.id) } },
          createMany: { data: toCreate },
          updateMany: toUpdate.map((prerequisite) => ({
            where: { id: prerequisite.id },
            data: prerequisite,
          })),
        },
      },
    });
  } else {
    // If prerequisites part is not complete, simply create all new prerequisites
    await prismaClient.dematerializedFeasibilityFile.update({
      where: { id: dFF.id },
      data: {
        prerequisites: {
          createMany: { data: prerequisites },
        },
        prerequisitesPartComplete: true,
      },
    });
  }

  if (dFF.sentToCandidateAt) {
    await resetDFFSentToCandidateState(dFF);
  }

  try {
    await generateAndUploadFeasibilityFileByCandidacyId(candidacyId);
  } catch (error) {
    console.error(error);
  }

  return getDematerializedFeasibilityFileWithPrerequisitesByCandidacyId({
    candidacyId,
  });
};
