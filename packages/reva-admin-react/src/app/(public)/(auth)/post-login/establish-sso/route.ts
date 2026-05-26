import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

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

// Fetch server-to-server reva-api/account/establish-sso et forward les
// Set-Cookie KEYCLOAK_IDENTITY raw au browser via headers.append. Atteint via
// window.location.assign depuis le login form (hard nav obligatoire).
// eslint-disable-next-line import/no-unused-modules
export async function GET(request: NextRequest) {
  const nextParam = request.nextUrl.searchParams.get("next");
  const target =
    nextParam && isSafeAdminRedirect(nextParam) ? nextParam : DEFAULT_REDIRECT;
  const redirectUrl = new URL(target, request.url);

  const cookieStore = await cookies();
  const postLoginCookie = cookieStore.get(POST_LOGIN_TOKENS_COOKIE);
  if (!postLoginCookie) {
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const apiResponse = await fetch(`${REST_API_URL}/account/establish-sso`, {
      headers: {
        cookie: `${POST_LOGIN_TOKENS_COOKIE}=${postLoginCookie.value}`,
      },
      redirect: "manual",
    });

    const response = NextResponse.redirect(redirectUrl);
    for (const raw of apiResponse.headers.getSetCookie()) {
      response.headers.append("set-cookie", raw);
    }
    // Invalide le cookie pour empêcher tout re-trigger de l'impersonation
    // pendant les 60s de TTL restantes.
    response.headers.append("set-cookie", CLEAR_TOKENS_COOKIE);
    return response;
  } catch (error) {
    console.error("establish-sso route handler: fetch reva-api failed", error);
    return NextResponse.redirect(redirectUrl);
  }
}
