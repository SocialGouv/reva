import {
  AAPAuditLogUserInfo,
  logAAPAuditEvent,
} from "@/modules/aap-log/features/logAAPAuditEvent";
import { prismaClient } from "@/prisma/client";

export const updateMaisonMereIsSignalized = async ({
  isSignalized,
  maisonMereAAPId,
  userInfo,
}: {
  isSignalized: boolean;
  maisonMereAAPId: string;
  userInfo: AAPAuditLogUserInfo;
}) => {
  const result = await prismaClient.maisonMereAAP.update({
    where: {
      id: maisonMereAAPId,
    },
    data: {
      isSignalized,
    },
  });

  await logAAPAuditEvent({
    eventType: "MAISON_MERE_SIGNALIZED_STATUS_UPDATED",
    maisonMereAAPId,
    userInfo,
    details: { isSignalized },
  });
  return result;
};
