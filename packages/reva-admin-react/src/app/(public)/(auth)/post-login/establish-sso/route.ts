import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { REST_API_URL } from "@/config/config";

import {
  POST_LOGIN_TOKENS_COOKIE,
  POST_LOGIN_TOKENS_COOKIE_PATH,
} from "../../_lib/post-login-cookie";

const DEFAULT_REDIRECT = "/admin2/post-login";
const CLEAR_TOKENS_COOKIE = `${POST_LOGIN_TOKENS_COOKIE}=; Path=${POST_LOGIN_TOKENS_COOKIE_PATH}; Max-Age=0; HttpOnly; SameSite=Lax`;

// Cookies de persistance keycloak-js (cf. keycloak.utils.ts, noms dupliqués
// car STORAGE_KEY n'est pas exporté). Purgés sur le success path pour que
// /post-login monte KeycloakProvider sans tokens stales : sinon init() les
// utilise et skip le silent-check-sso, ratant le KEYCLOAK_IDENTITY qu'on
// vient de poser. Pas de `Secure` ici (le browser rejette Set-Cookie Secure
// sur HTTP non-localhost) ni de `HttpOnly` (les originaux sont écrits via JS).
const CLEAR_PERSISTENT_TOKEN_COOKIES = [
  "REVA_ADMIN_AUTH_TOKENS_ACCESS_TOKEN",
  "REVA_ADMIN_AUTH_TOKENS_REFRESH_TOKEN",
  "REVA_ADMIN_AUTH_TOKENS_ID_TOKEN",
].map((name) => `${name}=; Path=/admin2; Max-Age=0; SameSite=Strict`);

// Anti-open-redirect : parse pour neutraliser ../, %2F, scheme absolu, etc.
const isSafeAdminRedirect = (next: string): boolean => {
  try {
    const url = new URL(next, "http://placeholder.local");
    return (
      url.origin === "http://placeholder.local" &&
      url.pathname.startsWith("/admin2/")
    );
  } catch {
    return false;
  }
};

// Location relatif obligatoire : NextResponse.redirect construirait l'URL
// absolue depuis request.url qui contient le hostname interne du container
// derrière reverse proxy
const redirectResponse = (target: string): Response =>
  new Response(null, { status: 302, headers: { Location: target } });

// eslint-disable-next-line import/no-unused-modules
export async function GET(request: NextRequest) {
  const nextParam = request.nextUrl.searchParams.get("next");
  const target =
    nextParam && isSafeAdminRedirect(nextParam) ? nextParam : DEFAULT_REDIRECT;

  const cookieStore = await cookies();
  const postLoginCookie = cookieStore.get(POST_LOGIN_TOKENS_COOKIE);
  if (!postLoginCookie) {
    return redirectResponse(target);
  }

  try {
    const apiResponse = await fetch(`${REST_API_URL}/account/establish-sso`, {
      headers: {
        cookie: `${POST_LOGIN_TOKENS_COOKIE}=${postLoginCookie.value}`,
      },
      redirect: "manual",
    });

    const response = redirectResponse(target);
    for (const raw of apiResponse.headers.getSetCookie()) {
      response.headers.append("set-cookie", raw);
    }
    // Invalide post_login_tokens pour bloquer un re-trigger d'impersonation.
    response.headers.append("set-cookie", CLEAR_TOKENS_COOKIE);
    // Purge les tokens persistants stales avant que /post-login monte
    // KeycloakProvider, sinon init() les utilise et skip le check-sso. Pas
    // appliqué au catch path : POST_LOGIN_TOKENS_COOKIE y survit et
    // PostLoginClient.resetKeycloakInstance ré-écrit déjà des tokens frais.
    for (const clear of CLEAR_PERSISTENT_TOKEN_COOKIES) {
      response.headers.append("set-cookie", clear);
    }
    return response;
  } catch (error) {
    console.error("establish-sso route handler: fetch reva-api failed", error);
    return redirectResponse(target);
  }
}
