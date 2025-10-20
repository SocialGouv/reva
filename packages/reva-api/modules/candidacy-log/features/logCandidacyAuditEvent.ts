import { CandidacyLogUserProfile, Prisma } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { CandidacyLogEventTypeAndDetails } from "../candidacy-log.types";

export interface CandidacyAuditLogUserInfo {
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}

export const buildCandidacyAuditLogUserInfo = (context: GraphqlContext) => ({
  userKeycloakId: context.auth.userInfo?.sub,
  userRoles: context.auth.userInfo?.realm_access?.roles || [],
  userEmail: context.auth.userInfo?.email,
});

type LogCandidacyAuditEventParams = {
  candidacyId: string;
  tx?: Prisma.TransactionClient; //optional transaction to use
} & CandidacyAuditLogUserInfo &
  CandidacyLogEventTypeAndDetails;

export const logCandidacyAuditEvent = ({
  candidacyId,
  userKeycloakId,
  userEmail,
  userRoles,
  eventType,
  details,
  tx,
}: LogCandidacyAuditEventParams) => {
  if (!userKeycloakId) {
    throw new Error(
      `Id keycloak absent lors du log de l'évenement de candidature ${eventType}`,
    );
  }

  if (!userEmail) {
    throw new Error(
      `Adresse électronique absente lors du log de l'évenement de candidature ${eventType}`,
    );
  }

  return (tx || prismaClient).candidacyLog.create({
    data: {
      candidacyId,
      userKeycloakId,
      userEmail,
      eventType,
      userProfile: getUserProfile({ userRoles }),
      details,
    },
  });
};

const getUserProfile = ({
  userRoles,
}: {
  userRoles: KeyCloakUserRole[];
}): CandidacyLogUserProfile => {
  if (userRoles.includes("admin")) {
    return CandidacyLogUserProfile.ADMIN;
  }
  if (
    userRoles.includes("manage_feasibility") ||
    userRoles.includes("manage_certification_authority_local_account")
  ) {
    return "CERTIFICATEUR";
  }
  if (
    userRoles.includes("gestion_maison_mere_aap") ||
    userRoles.includes("manage_candidacy")
  ) {
    return "AAP";
  }
  return "CANDIDAT";
};
