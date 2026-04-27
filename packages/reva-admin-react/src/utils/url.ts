export function sanitizeRedirectUrl(url: string | null): string | null {
  return url?.startsWith("/") && !url.startsWith("//") ? url : null;
}
