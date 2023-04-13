import { CandidacyBusinessEvent } from "../../domain/types/candidacy";
import { CandidateBusinessEvent } from "../../domain/types/candidate";
import { logger } from "./logger";

export enum BusinessTargetType {
  CANDIDATE = "CANDIDATE",
  CANDIDACY = "CANDIDACY",
  ACCOUNT = "ACCOUNT",
  SUBSCRIPTION_REQUEST = "SUBSCRIPTION_REQUEST",
  FUNDING_REQUEST = "FUNDING_REQUEST",
  PAYMENT_REQUEST = "PAYMENT_REQUEST",
}

export type BusinessEventType = CandidacyBusinessEvent | CandidateBusinessEvent;

interface BusinessEvent {
  userId?: string;
  userEmail?: string;
  targetType: BusinessTargetType;
  eventType: BusinessEventType;
  targetId?: string;
  isError: boolean;
  extraInfo?: Record<string, unknown>;
}

export async function logBusinessEvent(event: BusinessEvent) {
  if (event.isError) {
    logger.error(event)
  }
  else {
    logger.info(event);
  }
}

