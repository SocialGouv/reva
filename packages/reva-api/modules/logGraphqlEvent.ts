import { Either } from "purify-ts";

import { FunctionalError } from "../domain/types/functionalError";
import {
  BusinessEventType,
  BusinessTargetType,
  logBusinessEvent,
} from "../infra/logger/businessLogger";

export const logGraphqlEvent = ({
  context,
  result,
  targetId,
  targetType,
  eventType,
  extraInfo,
}: {
  context: GraphqlContext;
  result: Either<FunctionalError, Record<string, any>>;
  targetId?: string;
  targetType: BusinessTargetType;
  eventType: BusinessEventType;
  extraInfo?: Record<string, unknown>;
}) => {
  const isError = result.isLeft();
  logBusinessEvent({
    userId: context.auth.userInfo?.sub,
    targetType,
    eventType,
    targetId: targetId ?? (result.isRight() ? result.extract().id : undefined),
    isError,
    extraInfo: {
      ...(isError ? { error: result.extract() as FunctionalError } : {}),
      ...extraInfo,
    },
  });
};
