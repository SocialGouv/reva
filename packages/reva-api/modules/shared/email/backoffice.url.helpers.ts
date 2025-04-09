export const getBackofficeUrl = ({ path }: { path: string }) => {
  const baseUrl = process.env.BASE_URL || "http://localhost";
  const pagePath = path.startsWith("/") ? path : `/${path}`;
  const adminPath = `/admin2${pagePath}`;
  const url = new URL(adminPath, baseUrl);
  return url.toString();
};
