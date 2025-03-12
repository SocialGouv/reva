import { prismaClient } from "../../../prisma/client";
import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "../../aap-log/features/logAAPAuditEvent";

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
    throw new Error("L'organisme n'a pas été trouvé");
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
        organismLabel: organism.label,
        modaliteAccompagnement: organism.modaliteAccompagnement,
        visibleInSearchResults: organism.fermePourAbsenceOuConges,
      },
      userInfo,
    });
  }

  return result;
};
