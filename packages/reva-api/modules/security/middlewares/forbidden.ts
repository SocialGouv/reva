export const forbidden = () => (_: unknown) => () => {
  throw new Error("Forbidden (default security)");
};
