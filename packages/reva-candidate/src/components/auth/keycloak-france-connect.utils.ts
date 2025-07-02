export const getFranceConnectLoginUrl = () => {
  const baseApiUrl =
    process.env.NEXT_PUBLIC_API_GRAPHQL?.replace("/api/graphql", "") ||
    "http://localhost:8080";
  const keycloakUrl =
    process.env.NEXT_PUBLIC_KEYCLOAK_URL || "http://localhost:8888";

  /**
   * Il s'agit d'un POC pour tester la récupération
   * de données du bac à sable France Connect.
   * À terme, l'URL sera générée coté serveur.
   * Ce code ne doit pas être utilisé en production.
   */
  if (baseApiUrl.includes(".gouv.fr")) {
    return "#";
  }

  const url = new URL(
    `/auth/realms/reva-app/protocol/openid-connect/auth`,
    keycloakUrl,
  );

  url.searchParams.set("client_id", "reva-app");
  url.searchParams.set(
    "redirect_uri",
    `${baseApiUrl}/api/account/franceconnect/callback`,
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid");
  url.searchParams.set("kc_idp_hint", "franceconnect");
  url.searchParams.set("response_mode", "query");

  return url.toString();
};
