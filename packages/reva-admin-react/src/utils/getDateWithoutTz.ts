export const getDateWithoutTz = (date?: Date | number | null) => {
  if (!date) return null;

  const birthDateObject = new Date(date);
  return new Date(
    birthDateObject.valueOf() + birthDateObject.getTimezoneOffset() * 60 * 1000,
  );
};
