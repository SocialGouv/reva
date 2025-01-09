import { addDays } from "date-fns";

const CADUCITE_THRESHOLD_DAYS = 183;

export const dateThresholdCandidacyIsCaduque = (
  lastActivityDate: Date | number,
) => addDays(lastActivityDate, CADUCITE_THRESHOLD_DAYS);
