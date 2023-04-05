import { CandidacyBusinessEvent } from "../../domain/types/candidacy";
import { CandidateBusinessEvent } from "../../domain/types/candidate";
import { getAccountFromKeycloakId } from "../database/postgres/accounts";
import { logger } from "./logger";
import * as iam from "../iam/keycloak";

interface BusinessEvent {
  requestContext: GraphqlContext;
  eventType: CandidacyBusinessEvent | CandidateBusinessEvent;
  isError: boolean;
  targetId?: string;
  extraInfo?: Record<string, unknown>;
}

export async function logBusinessEvent(event: BusinessEvent) {
  logger.info({
    eventType: event.eventType,
    isError: event.isError,
    targetId: event.targetId,
    extraInfo: event.extraInfo,
    ...(await withAuthenticatedUserInfo(event)),
  });
}

const withAuthenticatedUserInfo = async (event: BusinessEvent) =>
  event.requestContext.auth
    ? {
        userKeycloakId: event.requestContext.auth.sub,
        userRoles: event.requestContext.auth.realm_access?.roles || [],
        userEmail: await getKeycloakUserEmail(
          event.requestContext.auth,
          event.requestContext.app
        ),
      }
    : {};

const getKeycloakUserEmail = async (auth: ContextAuth, app: ContextApp) => {
  // requestContext.app.keycloak || requestContext.app.getKeycloakAdmin()
  const eitherMaybeAccount = await iam.getAccount(app.getKeycloakAdmin())({username: "plop", email: ""});
  // return eitherAccount.isRight()
  //   ? eitherAccount.extract().email
  //   : `[error fetching email] ${eitherAccount.extract()}`;
};
