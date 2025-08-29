export const formatDateWithoutTimestamp = (date: Date) =>
  date.toLocaleDateString("fr-FR", {
    timeZone: "Europe/Paris",
  });
