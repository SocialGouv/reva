import { CandidacyLogUserProfile } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import { CandidacyEventType } from "../candidacy-log.types";

export const logCandidacyAuditEvent = ({
  candidacyId,
  userKeycloakId,
  userRoles,
  eventType,
}: {
  candidacyId: string;
  userKeycloakId?: string;
  userRoles: KeyCloakUserRole[];

  eventType: CandidacyEventType;
}) => {
  if (!userKeycloakId) {
    throw new Error(
      `No userKeycloakId when logging candidacy event ${eventType}`,
    );
  }

  return prismaClient.candidacyLog.create({
    data: {
      candidacyId,
      userKeycloakId,
      eventType,
      userProfile: getUserProfile({ userRoles }),
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
