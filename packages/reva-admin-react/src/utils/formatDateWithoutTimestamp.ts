import { format, parseISO } from "date-fns";

export const formatDateWithoutTimestamp = (isoDateString: string) =>
  format(parseISO(isoDateString), "dd/MM/yyyy");
