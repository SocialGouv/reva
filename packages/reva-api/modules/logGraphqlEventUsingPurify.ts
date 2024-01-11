import { Either } from "purify-ts";

import { FunctionalError } from "./shared/error/functionalError";
import {
  BusinessEventType,
  BusinessTargetType,
  logBusinessEvent,
} from "./shared/logger/businessLogger";

export const logGraphqlEventUsingPurify = ({
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
