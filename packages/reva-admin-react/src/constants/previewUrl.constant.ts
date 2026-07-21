// Backend signed preview URLs expire after 30 minutes (see SIGNED_URL_EXPIRE_SECONDS in reva-api).
// Refetch slightly earlier to avoid serving stale URLs.
export const PREVIEW_URL_REFETCH_INTERVAL_MS = 1000 * 60 * 29;
