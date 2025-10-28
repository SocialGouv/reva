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

  const candidacy = await prismaClient.candidacy.findUnique({
    where: {
      id: candidacyId,
    },
    include: {
      certification: {
        include: {
          prerequisites: true,
        },
      },
    },
  });

  const certificationPrerequisites = candidacy?.certification?.prerequisites;
  if (!certificationPrerequisites) {
    throw new Error("Prérequis de certification non trouvés");
  }
  const certificationPrerequisitesIds = certificationPrerequisites.map(
    (p) => p.id,
  );
  const incomingCertificationPrerequisitesIds = prerequisites
    .filter((p) => p.certificationPrerequisiteId)
    .map((p) => p.certificationPrerequisiteId);

  if (
    certificationPrerequisitesIds.some(
      (id) => !incomingCertificationPrerequisitesIds.includes(id),
    )
  ) {
    throw new Error(
      "Certains prérequis attachés à la certification sont manquants",
    );
  }

  if (dFF.prerequisitesPartComplete) {
    const incomingIds = prerequisites.filter((p) => p.id).map((p) => p.id);
    const existingIds = dFF.prerequisites.map((p) => p.id);
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
          createMany: {
            data: prerequisites.map((p) => ({
              ...p,
              id: p.id || uuidv4(),
            })),
          },
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
