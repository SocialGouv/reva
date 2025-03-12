import { prismaClient } from "../../../prisma/client";
import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "../../aap-log/features/logAAPAuditEvent";

export const updateOrganismDegreesAndFormacodes = async ({
  organismId,
  degreeIds,
  formacodeIds,
  userInfo,
}: {
  organismId: string;
  degreeIds: string[];
  formacodeIds: string[];
  userInfo: AAPAuditLogUserInfo;
}) => {
  const formacodes = await prismaClient.formacode.findMany({
    where: {
      code: {
        in: formacodeIds,
      },
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
