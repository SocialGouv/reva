//format an UTC date to a time string without doing any timezone conversion
//ie 2025-09-29T14:00:00.000Z -> 14:00

import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export const formatUTCTimeWithoutTimezoneConversion = (utcDateTime: Date) => {
  const utcTimeZoneDateTime = new TZDate(utcDateTime.getTime(), "UTC");

  return format(utcTimeZoneDateTime, "HH:mm");
};
