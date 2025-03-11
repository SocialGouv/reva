import { prismaClient } from "../../../prisma/client";
import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "../../aap-log/features/logAAPAuditEvent";

export const updateMaisonMereOrganismsIsActive = async ({
  isActive,
  maisonMereAAPId,
  userInfo,
}: {
  isActive: boolean;
  maisonMereAAPId: string;
  userInfo: AAPAuditLogUserInfo;
}) => {
  const result = await prismaClient.maisonMereAAP.update({
    where: {
      id: maisonMereAAPId,
    },
    data: {
      isActive,
    },
  });

  await logAAPAuditEvent({
    eventType: "MAISON_MEREE_ORGANISMS_ISACTIVE_UPDATED",
    maisonMereAAPId,
    userInfo,
    details: { isActive },
  });

  return result;
};
