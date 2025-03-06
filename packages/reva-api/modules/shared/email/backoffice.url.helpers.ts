export const getBackofficeUrl = ({ path }: { path: string }) => {
  const baseUrl = process.env.BASE_URL || "";
  const url = new URL(path, `${baseUrl}/admin2`);
  return url.toString();
};
