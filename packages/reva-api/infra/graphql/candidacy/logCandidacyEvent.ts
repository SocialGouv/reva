import { Either } from "purify-ts";

import { FunctionalError } from "../../../domain/types/functionalError";
import {
  BusinessEventType,
  BusinessTargetType,
} from "../../logger/businessLogger";
import { logGraphqlEvent } from "../logGraphqlEvent";

export const logCandidacyEvent = ({
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
  logGraphqlEvent({
    context,
    result,
    eventType,
    targetId: candidacyId,
    targetType: BusinessTargetType.CANDIDACY,
    extraInfo,
  });
};
