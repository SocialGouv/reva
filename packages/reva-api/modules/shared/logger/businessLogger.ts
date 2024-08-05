import { CandidacyBusinessEvent } from "../../candidacy/candidacy.types";
import { CandidateBusinessEvent } from "../../candidate/candidate.types";

export type BusinessTargetType =
  | "CANDIDATE"
  | "CANDIDACY"
  | "ACCOUNT"
  | "SUBSCRIPTION_REQUEST"
  | "FUNDING_REQUEST"
  | "PAYMENT_REQUEST"
  | "FUNDING_REQUEST_UNIFVAE";

export type BusinessEventType = CandidacyBusinessEvent | CandidateBusinessEvent;
