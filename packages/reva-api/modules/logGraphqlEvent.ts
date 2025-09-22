import {
  BusinessEventType,
  BusinessTargetType,
} from "./shared/logger/businessLogger";
import { logger } from "./shared/logger/logger";

export const logGraphqlEvent = ({
  context,
  result,
  targetId,
  targetType,
  eventType,
  extraInfo,
}: {
  context: GraphqlContext;
  result: Record<string, any>;
  targetId?: string;
  targetType: BusinessTargetType;
  eventType: BusinessEventType;
  extraInfo?: Record<string, unknown>;
}) => {
  logger.info({
    userId: context.auth.userInfo?.sub,
    targetType,
    eventType,
    targetId: targetId ?? result.id,
    extraInfo: {
      ...extraInfo,
    },
  });
};
