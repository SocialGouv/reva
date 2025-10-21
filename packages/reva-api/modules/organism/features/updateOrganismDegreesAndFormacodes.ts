import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { prismaClient } from "@/prisma/client";

export const updateOrganismDegreesAndFormacodes = async ({
  organismId,
  degreeIds,
  formacodeIds,
  conventionCollectiveIds,
  userInfo,
}: {
  organismId: string;
  degreeIds: string[];
  formacodeIds: string[];
  conventionCollectiveIds: string[];
  userInfo: AAPAuditLogUserInfo;
}) => {
  const formacodes = await prismaClient.formacode.findMany({
    where: {
      code: {
        in: formacodeIds,
      },
      version: "v14",
    },
  });

  // Check if formacode type is SUB_DOMAIN
  for (const formacode of formacodes) {
    if (formacode.type != "SUB_DOMAIN") {
      throw new Error(
        "Les formacodes sélectionnés doivent correspondre à des sous domaines",
      );
    }
  }

  const [, , , , organism] = await prismaClient.$transaction([
    prismaClient.organismOnDegree.deleteMany({ where: { organismId } }),
    prismaClient.organismOnDegree.createMany({
      data: degreeIds.map((degreeId) => ({ organismId, degreeId })),
    }),

    prismaClient.organismOnFormacode.deleteMany({ where: { organismId } }),
    prismaClient.organismOnFormacode.createMany({
      data: formacodes.map((formacode) => ({
        organismId,
        formacodeId: formacode.id,
      })),
    }),

    prismaClient.organism.findUnique({
      where: { id: organismId },
    }),
    prismaClient.organismOnConventionCollective.deleteMany({
      where: { organismId },
    }),
    prismaClient.organismOnConventionCollective.createMany({
      data: conventionCollectiveIds.map((ccnId) => ({
        organismId,
        ccnId,
      })),
    }),
  ]);

  if (organism?.maisonMereAAPId) {
    await logAAPAuditEvent({
      eventType: "ORGANISM_DEGREES_AND_FORMACODES_UPDATED",
      maisonMereAAPId: organism.maisonMereAAPId,
      userInfo,
      details: {
        organismId: organism.id,
        organismLabel: organism.label,
        modaliteAccompagnement: organism.modaliteAccompagnement,
      },
    });
  }
  return organism;
};
