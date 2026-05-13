import { deleteCookie, getCookie, setCookie } from "cookies-next";

const STORAGE_KEY = "VAE_COLLECTIVE_AUTH_TOKENS";
const ACCESS_TOKEN_STORAGE_KEY = STORAGE_KEY + "_ACCESS_TOKEN";
const REFRESH_TOKEN_STORAGE_KEY = STORAGE_KEY + "_REFRESH_TOKEN";
const ID_TOKEN_STORAGE_KEY = STORAGE_KEY + "_ID_TOKEN";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

const COOKIE_OPTIONS = {
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  // Scope au basePath : cookies absents des requetes des autres apps Next.
  path: "/vae-collective",
};

export const getTokens = (): Tokens | undefined => {
  try {
    const accessToken = getCookie(ACCESS_TOKEN_STORAGE_KEY) as string;
    const refreshToken = getCookie(REFRESH_TOKEN_STORAGE_KEY) as string;
    const idToken = getCookie(ID_TOKEN_STORAGE_KEY) as string;
    if (accessToken || refreshToken || idToken) {
      return {
        accessToken,
        refreshToken,
        idToken,
      };
    }
  } catch (error) {
    console.error(`Impossible de récupérer les jetons : ${error}`);
  }
};

export const saveTokens = (tokens: Tokens): void => {
  try {
    setCookie(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken, COOKIE_OPTIONS);
    setCookie(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken, COOKIE_OPTIONS);
    setCookie(ID_TOKEN_STORAGE_KEY, tokens.idToken, COOKIE_OPTIONS);
  } catch (error) {
    console.error(`Impossible de sauvegarder les jetons : ${error}`);
  }
};

export const removeTokens = (): void => {
  try {
    deleteCookie(ACCESS_TOKEN_STORAGE_KEY, COOKIE_OPTIONS);
    deleteCookie(REFRESH_TOKEN_STORAGE_KEY, COOKIE_OPTIONS);
    deleteCookie(ID_TOKEN_STORAGE_KEY, COOKIE_OPTIONS);
  } catch (error) {
    console.error(`Impossible de supprimer les jetons : ${error}`);
  }
};

// Cookies legacy poses avec path:"/" avant le scoping au basePath.
// A retirer ~30j apres deploy.
export const removeLegacyTokens = (): void => {
  try {
    deleteCookie(ACCESS_TOKEN_STORAGE_KEY, { path: "/" });
    deleteCookie(REFRESH_TOKEN_STORAGE_KEY, { path: "/" });
    deleteCookie(ID_TOKEN_STORAGE_KEY, { path: "/" });
  } catch (error) {
    console.error(`Impossible de supprimer les jetons legacy : ${error}`);
  }
};
