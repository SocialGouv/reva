import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { REST_API_URL } from "@/config/config";

import {
  POST_LOGIN_TOKENS_COOKIE,
  POST_LOGIN_TOKENS_COOKIE_PATH,
} from "../../_lib/post-login-cookie";

const DEFAULT_REDIRECT = "/admin2/post-login";
const CLEAR_TOKENS_COOKIE = `${POST_LOGIN_TOKENS_COOKIE}=; Path=${POST_LOGIN_TOKENS_COOKIE_PATH}; Max-Age=0; HttpOnly; SameSite=Lax`;

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
    const setCookies = apiResponse.headers.getSetCookie();
    for (const raw of setCookies) {
      response.headers.append("set-cookie", raw);
    }
    // Clear post_login_tokens UNIQUEMENT si impersonation a posé un cookie :
    // bloque le re-trigger pour les super-admins. Pour les autres rôles
    // (manage_candidacy, manage_feasibility, ...) establishSsoSession retourne
    // [] côté API, et /post-login a besoin du cookie survivant pour injecter
    // les tokens via PostLoginClient.resetKeycloakInstance.
    if (setCookies.length > 0) {
      response.headers.append("set-cookie", CLEAR_TOKENS_COOKIE);
    }
    return response;
  } catch (error) {
    console.error("establish-sso route handler: fetch reva-api failed", error);
    return redirectResponse(target);
  }
}
