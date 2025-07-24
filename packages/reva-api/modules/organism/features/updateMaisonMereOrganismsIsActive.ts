import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { prismaClient } from "@/prisma/client";

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
    eventType: "MAISON_MERE_ORGANISMS_ISACTIVE_UPDATED",
    maisonMereAAPId,
    userInfo,
    details: { isActive },
  });

  return result;
};
