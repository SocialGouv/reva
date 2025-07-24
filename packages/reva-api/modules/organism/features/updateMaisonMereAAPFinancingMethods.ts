import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { prismaClient } from "@/prisma/client";

export const updateMaisonMereAAPFinancingMethods = async ({
  maisonMereAAPId,
  isMCFCompatible,
  userInfo,
}: {
  maisonMereAAPId: string;
  isMCFCompatible: boolean;
  userInfo: AAPAuditLogUserInfo;
}) => {
  const result = await prismaClient.maisonMereAAP.update({
    where: { id: maisonMereAAPId },
    data: { isMCFCompatible },
  });

  await logAAPAuditEvent({
    eventType: "MAISON_MERE_FINANCING_METHODS_UPDATED",
    maisonMereAAPId,
    userInfo,
    details: { isMCFCompatible },
  });

  return result;
};
