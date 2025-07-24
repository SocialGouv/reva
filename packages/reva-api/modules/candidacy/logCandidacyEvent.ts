import { BusinessEventType } from "@/modules/shared/logger/businessLogger";

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
