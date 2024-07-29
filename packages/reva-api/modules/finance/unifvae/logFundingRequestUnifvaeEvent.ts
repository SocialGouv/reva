import { FunctionalError } from "../../shared/error/functionalError";
import { BusinessEventType } from "../../shared/logger/businessLogger";
import { logGraphqlEvent } from "../../logGraphqlEvent";

export const logFundingRequestUnifvaeEvent = ({
  context,
  result,
  eventType,
  extraInfo,
  candidacyId,
}: {
  candidacyId?: string;
  context: GraphqlContext;
  result: Record<string, unknown> | FunctionalError;
  eventType: BusinessEventType;
  extraInfo?: Record<string, unknown>;
}) =>
  logGraphqlEvent({
    context,
    result,
    eventType,
    targetId: candidacyId,
    targetType: "FUNDING_REQUEST_UNIFVAE",
    extraInfo,
  });
