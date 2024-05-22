const OOS_ENDPOINT = new URL(process.env.OUTSCALE_OBJECT_STORAGE_ENDPOINT ?? "");
export const OOS_DOMAIN = `https://${process.env.OUTSCALE_BUCKET_NAME}.${OOS_ENDPOINT.hostname}`;
export const FILE_PREVIEW_ROUTE_PATH = "/preview";
