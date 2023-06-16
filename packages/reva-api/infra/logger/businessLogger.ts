import { CandidacyBusinessEvent } from "../../domain/types/candidacy";
import { CandidateBusinessEvent } from "../../domain/types/candidate";
import { logger } from "./logger";

export type BusinessTargetType =
  | "CANDIDATE"
  | "CANDIDACY"
  | "ACCOUNT"
  | "SUBSCRIPTION_REQUEST"
  | "FUNDING_REQUEST"
  | "PAYMENT_REQUEST";

export type BusinessEventType = CandidacyBusinessEvent | CandidateBusinessEvent;

interface BusinessEvent {
  userId?: string;
  targetType: BusinessTargetType;
  eventType: BusinessEventType;
  targetId?: string;
  isError: boolean;
  extraInfo?: Record<string, unknown>;
}

export async function logBusinessEvent(event: BusinessEvent) {
  if (event.isError) {
    logger.error(event);
  } else {
    logger.info(event);
  }
}
