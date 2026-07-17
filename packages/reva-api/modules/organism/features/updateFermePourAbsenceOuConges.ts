import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { ORGANISME_PAS_ETE_TROUVE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

export const updateFermePourAbsenceOuConges = async ({
  organismId,
  fermePourAbsenceOuConges,
  userInfo,
}: {
  organismId: string;
  fermePourAbsenceOuConges: boolean;
  userInfo: AAPAuditLogUserInfo;
}) => {
  const organism = await prismaClient.organism.findUnique({
    where: { id: organismId },
  });

  if (!organism) {
    throw new Error(ORGANISME_PAS_ETE_TROUVE);
  }

  const result = prismaClient.organism.update({
    where: { id: organismId },
    data: { fermePourAbsenceOuConges },
  });

  if (organism.maisonMereAAPId) {
    await logAAPAuditEvent({
      eventType: "ORGANISM_SEARCH_RESULTS_VISIBILITY_UPDATED",
      maisonMereAAPId: organism.maisonMereAAPId,
      details: {
        organismId: organism.id,
        organismLabel: organism.label,
        modaliteAccompagnement: organism.modaliteAccompagnement,
        visibleInSearchResults: organism.fermePourAbsenceOuConges,
      },
      userInfo,
    });
  }

  return result;
};
