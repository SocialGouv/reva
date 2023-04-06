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

interface BusinessEvent {
  userId?: string;
  userEmail?: string;
  targetType: BusinessTargetType;
  eventType: CandidacyBusinessEvent | CandidateBusinessEvent;
  targetId?: string;
  isError: boolean;
  extraInfo?: Record<string, unknown>;
}

export async function logBusinessEvent(event: BusinessEvent) {
  logger.info(event);
}
