export const formatIso8601Time = (iso8601Time: string) =>
  iso8601Time.replace(":00.000Z", "");
