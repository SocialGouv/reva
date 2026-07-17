import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { ORGANISME_PAS_ETE_TROUVE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

export const deleteLieuAccueil = async ({
  maisonMereAAPId,
  organismId,
  userInfo,
}: {
  maisonMereAAPId: string;
  organismId: string;
  userInfo: AAPAuditLogUserInfo;
}) => {
  const organism = await prismaClient.organism.findUnique({
    where: { id: organismId },
  });
  if (!organism) {
    throw new Error(ORGANISME_PAS_ETE_TROUVE);
  }

  if (organism.maisonMereAAPId !== maisonMereAAPId) {
    throw new Error("L'organisme n'appartient pas à la maison mère");
  }

  if (organism.modaliteAccompagnement !== "LIEU_ACCUEIL") {
    throw new Error("L'organisme n'est pas un lieu d'accueil");
  }

  const organismHasCandidacies = await prismaClient.organism.findUnique({
    where: {
      id: organismId,
      candidacies: { some: {} },
    },
  });

  if (organismHasCandidacies) {
    throw new Error(
      "Impossible de supprimer le lieu d'accueil car il a des candidatures",
    );
  }

  await prismaClient.$transaction(async (tx) => {
    await tx.organism.delete({ where: { id: organismId } });
    await logAAPAuditEvent({
      eventType: "LIEU_ACCUEIL_DELETED",
      maisonMereAAPId,
      userInfo: userInfo,
      details: {
        organismId,
        organismLabel: organism.label,
        organismNomPublic: organism.nomPublic || "",
      },
      tx,
    });
  });
};
