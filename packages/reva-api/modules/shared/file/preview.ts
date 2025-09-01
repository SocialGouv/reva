const OOS_ENDPOINT = process.env.OUTSCALE_OBJECT_STORAGE_ENDPOINT
  ? new URL(process.env.OUTSCALE_OBJECT_STORAGE_ENDPOINT)
  : null;
export const OOS_DOMAIN = OOS_ENDPOINT
  ? `https://${process.env.OUTSCALE_BUCKET_NAME}.${OOS_ENDPOINT.hostname}`
  : "";
export const FILE_PREVIEW_ROUTE_PATH = "/api/preview";

export const FILE_PREVIEW_ROUTE_PATH_ADMIN_FRONTEND =
  process.env.APP_ENV === "production" ||
  process.env.APP_ENV === "staging" ||
  process.env.APP_ENV === "sandbox"
    ? FILE_PREVIEW_ROUTE_PATH
    : `/admin2${FILE_PREVIEW_ROUTE_PATH}`;
