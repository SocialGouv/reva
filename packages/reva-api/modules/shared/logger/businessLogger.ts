import { CandidacyBusinessEvent } from "@/modules/candidacy/candidacy.types";
import { CandidateBusinessEvent } from "@/modules/candidate/candidate.types";

export type BusinessTargetType =
  | "CANDIDATE"
  | "CANDIDACY"
  | "ACCOUNT"
  | "SUBSCRIPTION_REQUEST"
  | "FUNDING_REQUEST"
  | "PAYMENT_REQUEST"
  | "FUNDING_REQUEST_UNIFVAE";

export type BusinessEventType = CandidacyBusinessEvent | CandidateBusinessEvent;
