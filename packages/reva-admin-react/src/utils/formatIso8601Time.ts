import { format, parseISO } from "date-fns";

export const formatIso8601Time = (iso8601Time: string) =>
  format(parseISO(iso8601Time), "HH:mm");
