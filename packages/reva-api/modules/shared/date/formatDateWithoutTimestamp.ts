type DateFormat = "dd/MM/yyyy" | "dd MMMM yyyy";

export const formatDateWithoutTimestamp = (
  date: Date,
  format: DateFormat = "dd/MM/yyyy",
) => {
  if (format == "dd MMMM yyyy") {
    return date.toLocaleDateString("fr-FR", {
      timeZone: "Europe/Paris",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris",
  });
};
