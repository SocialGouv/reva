import { KEYCLOAK_URL, REST_API_URL } from "@/config/config";

export const getFranceConnectLoginUrl = (certificationId?: string) => {
  /**
   * Il s'agit d'un POC pour tester la récupération
   * de données du bac à sable France Connect.
   * À terme, l'URL sera générée coté serveur.
   * Ce code ne doit pas être utilisé en production.
   */
  if (REST_API_URL.includes(".gouv.fr")) {
    return "#";
  }

  const url = new URL(
    `${KEYCLOAK_URL}/realms/reva-app/protocol/openid-connect/auth`,
  );

  url.searchParams.set("client_id", "reva-app");
  url.searchParams.set(
    "redirect_uri",
    `${REST_API_URL}/account/franceconnect/callback`,
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid");
  url.searchParams.set("kc_idp_hint", "franceconnect");
  url.searchParams.set("response_mode", "query");

  if (certificationId) {
    // Le state OAuth sert en premier lieu à la protection CSRF.
    // On l'utilise ici aussi pour transmettre le certificationId.
    // TODO: utiliser un JWT chiffré (secret + date d'expiration).
    const state = btoa(JSON.stringify({ certificationId }));
    url.searchParams.set("state", state);
  }

  return url.toString();
};
