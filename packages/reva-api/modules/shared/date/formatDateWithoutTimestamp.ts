type DateFormat = "dd/MM/yyyy" | "dd MMMM yyyy";

export const formatDateWithoutTimestamp = (
  date: Date,
  format: DateFormat = "dd/MM/yyyy",
  timeZone: string = "Europe/Paris",
) => {
  if (format == "dd MMMM yyyy") {
    return date.toLocaleDateString("fr-FR", {
      timeZone,
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("fr-FR", {
    timeZone,
  });
};
