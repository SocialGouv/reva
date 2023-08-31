import { Left, Right } from "purify-ts";

import { FunctionalError } from "../../../domain/types/functionalError";
import { logGraphqlEvent } from "../../logGraphqlEvent";
import { BusinessEventType } from "../../shared/logger/businessLogger";

export const logFundingRequestUnifvaeEvent = ({
  context,
  result,
  eventType,
  extraInfo,
  candidacyId,
}: {
  candidacyId?: string;
  context: GraphqlContext;
  result: Record<string, unknown> | FunctionalError; //Either<FunctionalError, Record<string, any>>;
  eventType: BusinessEventType;
  extraInfo?: Record<string, unknown>;
}) => {
  logGraphqlEvent({
    context,
    result: result instanceof FunctionalError ? Left(result) : Right(result),
    eventType,
    targetId: candidacyId,
    targetType: "FUNDING_REQUEST_UNIFVAE",
    extraInfo,
  });
};
