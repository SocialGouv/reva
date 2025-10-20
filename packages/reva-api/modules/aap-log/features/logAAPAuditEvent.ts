import { Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { AAPLogEventTypeAndDetails, AAPLogUserProfile } from "../aap-log.types";

export const buildAAPAuditLogUserInfoFromContext = (
  context: GraphqlContext,
) => ({
  userKeycloakId: context.auth.userInfo?.sub,
  userRoles: context.auth.userInfo?.realm_access?.roles || [],
  userEmail: context.auth.userInfo?.email,
});
export interface AAPAuditLogUserInfo {
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}

type LogAAPAuditEventParams = {
  maisonMereAAPId: string;
  tx?: Prisma.TransactionClient; //optional transaction to use
  userInfo: AAPAuditLogUserInfo;
} & AAPLogEventTypeAndDetails;

export const logAAPAuditEvent = ({
  eventType,
  maisonMereAAPId,
  userInfo,
  details,
  tx,
}: LogAAPAuditEventParams) => {
  if (!userInfo.userKeycloakId) {
    throw new Error(
      `Id keycloak absent lors du log de l'évenement AAP ${eventType}`,
    );
  }

  if (!userInfo.userEmail) {
    throw new Error(
      `Adresse électronique absent lors du log de l'évenement AAP ${eventType}`,
    );
  }

  return (tx || prismaClient).aAPLog.create({
    data: {
      maisonMereAAPId,
      userKeycloakId: userInfo.userKeycloakId,
      userEmail: userInfo.userEmail,
      eventType,
      userProfile: getUserProfile({ userRoles: userInfo.userRoles }),
      details,
    },
  });
};

const getUserProfile = ({
  userRoles,
}: {
  userRoles: KeyCloakUserRole[];
}): AAPLogUserProfile => {
  if (userRoles.includes("admin")) {
    return "ADMIN";
  }
  if (
    userRoles.includes("gestion_maison_mere_aap") ||
    userRoles.includes("manage_candidacy")
  ) {
    return "AAP";
  }
  throw new Error("Role non géré pour le log d'audit AAP");
};
