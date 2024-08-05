import {
  logCandidacyAuditEvent,
  CandidacyAuditLogUserInfo,
} from "../../candidacy-log/features/logCandidacyAuditEvent";
import { existsCandidacyWithActiveStatus } from "./existsCandidacyWithActiveStatus";
import { updateCandidacyStatus } from "./updateCandidacyStatus";

export const takeOverCandidacy = async ({
  candidacyId,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
} & CandidacyAuditLogUserInfo) => {
  if (
    !(await existsCandidacyWithActiveStatus({
      candidacyId,
      status: "VALIDATION",
    }))
  ) {
    throw new Error(
      `La candidature ${candidacyId} ne peut être prise en charge`,
    );
  }

  const result = await updateCandidacyStatus({
    candidacyId,
    status: "PRISE_EN_CHARGE",
  });

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "CANDIDACY_TAKEN_OVER",
    userKeycloakId,
    userEmail,
    userRoles,
  });

  return result;
};
