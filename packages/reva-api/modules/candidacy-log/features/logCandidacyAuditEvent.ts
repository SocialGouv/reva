import { CandidacyLogUserProfile } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { CandidacyLogEventTypeAndDetails } from "../candidacy-log.types";

type LogCandidacyAuditEventParams = {
  candidacyId: string;
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
} & CandidacyLogEventTypeAndDetails;

export const logCandidacyAuditEvent = ({
  candidacyId,
  userKeycloakId,
  userEmail,
  userRoles,
  eventType,
  details,
}: LogCandidacyAuditEventParams) => {
  if (!userKeycloakId) {
    throw new Error(
      `Id keycloak absent lors du log de l'évenement de candidature ${eventType}`,
    );
  }

  if (!userEmail) {
    throw new Error(
      `Email absent lors du log de l'évenement de candidature ${eventType}`,
    );
  }

  return prismaClient.candidacyLog.create({
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
