import { CandidacyBusinessEvent } from "../../domain/types/candidacy";
import { CandidateBusinessEvent } from "../../domain/types/candidate";
import { getAccountFromKeycloakId } from "../database/postgres/accounts";
import { logger } from "./logger";

interface BusinessEvent {
  authenticatedUser?: {
    realm_access?: {
      roles: KeyCloakUserRole[];
    };
    sub: string;
  };
  eventType: CandidacyBusinessEvent | CandidateBusinessEvent;
  isFailure: boolean;
  targetId?: string;
  extraInfo?: Record<string, unknown>;
}

export async function logBusinessEvent(event: BusinessEvent) {
  logger.info({
    ...event,
    ...(await withAuthenticatedUserInfo(event)),
  });
}

const withAuthenticatedUserInfo = async (event: BusinessEvent) =>
  event.authenticatedUser
    ? {
        userKeycloakId: event.authenticatedUser?.sub,
        userRoles: event.authenticatedUser.realm_access?.roles || [],
        userEmail: await getKeycloakUserEmail(event.authenticatedUser.sub),
      }
    : {};

const getKeycloakUserEmail = async (keycloakId: string) => {
  const eitherAccount = await getAccountFromKeycloakId(keycloakId);
  return eitherAccount.isRight()
    ? eitherAccount.extract().email
    : `[error fetching email] ${eitherAccount.extract()}`;
};
