import { prismaClient } from "../../../prisma/client";
import {
  logCandidacyAuditEvent,
  CandidacyAuditLogUserInfo,
} from "../../candidacy-log/features/logCandidacyAuditEvent";
import { getCandidacyById } from "./getCandidacyById";
import { updateCandidacyStatus } from "./updateCandidacyStatus";

export const takeOverCandidacy = async ({
  candidacyId,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
} & CandidacyAuditLogUserInfo) =>
  //execute all steps in the same transaction to ensure data consistency
  prismaClient.$transaction(async (tx) => {
    const candidacy = await getCandidacyById({ candidacyId, tx });

    if (!candidacy) {
      throw new Error("Candidature non trouvée");
    }

    //candidacy is already taken over or premature call
    if (candidacy.status !== "VALIDATION") {
      return candidacy;
    }

    const result = await updateCandidacyStatus({
      candidacyId,
      status: "PRISE_EN_CHARGE",
      tx,
    });

    await logCandidacyAuditEvent({
      candidacyId,
      eventType: "CANDIDACY_TAKEN_OVER",
      userKeycloakId,
      userEmail,
      userRoles,
      tx,
    });

    return result;
  });
