import { tz } from "@date-fns/tz";
import { startOfToday } from "date-fns";

export const getAppointmentTemporalStatus = ({ date }: { date: Date }) => {
  //As of now, we only consider the date, not the time when determining if an appointment is upcoming or past
  const now = startOfToday({ in: tz("UTC") });

  if (date >= now) {
    return "UPCOMING";
  } else {
    return "PAST";
  }
};
