export const getAppointmentTemporalStatus = ({ date }: { date: Date }) => {
  const now = new Date();

  if (date >= now) {
    return "UPCOMING";
  } else {
    return "PAST";
  }
};
