import { format, parseISO } from "date-fns";

export const formatIso8601Date = (iso8601Date: string) =>
  format(parseISO(iso8601Date), "dd/MM/yyyy");
