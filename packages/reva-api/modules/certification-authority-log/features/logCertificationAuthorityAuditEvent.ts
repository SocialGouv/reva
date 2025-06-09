import { Prisma } from "@prisma/client";

import { prismaClient } from "../../../prisma/client";
import {
  CertificationAuthorityLogEventTypeAndDetails,
  CertificationAuthorityLogUserProfile,
} from "../certification-authority-log.types";

interface CertificationAuthorityAuditLogUserInfo {
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}

type LogCertificationAuthorityAuditEventParams = {
  certificationAuthorityId: string;
  tx?: Prisma.TransactionClient; //optional transaction to use
  userInfo: CertificationAuthorityAuditLogUserInfo;
} & CertificationAuthorityLogEventTypeAndDetails;

export const logCertificationAuthorityAuditEvent = ({
  eventType,
  certificationAuthorityId,
  userInfo,
  details,
  tx,
}: LogCertificationAuthorityAuditEventParams) => {
  if (!userInfo.userKeycloakId) {
    throw new Error(
      `Id keycloak absent lors du log de l'évenement certificateur ${eventType}`,
    );
  }

  if (!userInfo.userEmail) {
    throw new Error(
      `Email absent lors du log de l'évenement certificateur ${eventType}`,
    );
  }

  return (tx || prismaClient).certificationAuthorityLog.create({
    data: {
      certificationAuthorityId,
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
}): CertificationAuthorityLogUserProfile => {
  if (userRoles.includes("admin")) {
    return "ADMIN";
  }
  if (userRoles.includes("manage_certification_authority_local_account")) {
    return "CERTIFICATION_AUTHORITY";
  }
  if (userRoles.includes("manage_feasibility")) {
    return "CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT";
  }
  throw new Error("Role non géré pour le log d'audit certificateur");
};
