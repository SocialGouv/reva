import { logGraphqlEvent } from "../logGraphqlEvent";
import { BusinessEventType } from "../shared/logger/businessLogger";

export const logCandidacyEvent = ({
  context,
  result,
  eventType,
  extraInfo,
  candidacyId,
}: {
  candidacyId?: string;
  context: GraphqlContext;
  result: Record<string, any>;
  eventType: BusinessEventType;
  extraInfo?: Record<string, unknown>;
}) => {
  logGraphqlEvent({
    context,
    result,
    eventType,
    targetId: candidacyId,
    targetType: "CANDIDACY",
    extraInfo,
  });
};
