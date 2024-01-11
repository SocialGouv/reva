import { Either } from "purify-ts";

import { logGraphqlEventUsingPurify } from "../logGraphqlEventUsingPurify";
import { FunctionalError } from "../shared/error/functionalError";
import { BusinessEventType } from "../shared/logger/businessLogger";

export const logCandidacyEventUsingPurify = ({
  context,
  result,
  eventType,
  extraInfo,
  candidacyId,
}: {
  candidacyId?: string;
  context: GraphqlContext;
  result: Either<FunctionalError, Record<string, any>>;
  eventType: BusinessEventType;
  extraInfo?: Record<string, unknown>;
}) => {
  logGraphqlEventUsingPurify({
    context,
    result,
    eventType,
    targetId: candidacyId,
    targetType: "CANDIDACY",
    extraInfo,
  });
};
