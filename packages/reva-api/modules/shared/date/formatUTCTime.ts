//format an UTC date to a time string without doing any timezone conversion
//ie 2025-09-29T14:00:00.000Z -> 14:00

import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";

export const formatUTCTime = (
  utcDateTime: Date,
  timeZone: string = "Europe/Paris",
) => {
  const utcTimeZoneDateTime = new TZDate(utcDateTime.getTime(), timeZone);

  return format(utcTimeZoneDateTime, "HH:mm");
};
