export function sanitizeRedirectUrl(url: string | null): string | null {
  if (!url || !url.startsWith("/") || url.startsWith("//")) return null;
  // "/" cree une boucle: app/page.tsx redirige vers /post-login et Next 16
  // preserve les search params a travers la redirection serveur.
  if (url === "/") return null;
  return url;
}
