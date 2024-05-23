const OOS_ENDPOINT = process.env.OUTSCALE_OBJECT_STORAGE_ENDPOINT ? new URL(process.env.OUTSCALE_OBJECT_STORAGE_ENDPOINT) : null;
export const OOS_DOMAIN = OOS_ENDPOINT ? `https://${process.env.OUTSCALE_BUCKET_NAME}.${OOS_ENDPOINT.hostname}` : "";
export const FILE_PREVIEW_ROUTE_PATH = "/api/preview";
