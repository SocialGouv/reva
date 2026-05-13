import { deleteCookie, getCookie, setCookie } from "cookies-next";

import { errorToast } from "../toast/toast";

const storageKey = "tokens";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

const COOKIE_OPTIONS = {
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  // Scope au basePath : cookie absent des requetes des autres apps Next.
  path: "/candidat",
};

export const getTokens = (): Tokens | undefined => {
  try {
    const tokensData = getCookie(storageKey);
    if (tokensData) {
      const tokens = JSON.parse(tokensData as string);
      return tokens;
    }
  } catch (error) {
    errorToast(`Impossible de récupérer les jetons : ${error}`);
  }

  return undefined;
};

export const saveTokens = (tokens: Tokens): void => {
  try {
    setCookie(storageKey, JSON.stringify(tokens), COOKIE_OPTIONS);
  } catch (error) {
    errorToast(`Impossible de sauvegarder les jetons : ${error}`);
  }
};

export const removeTokens = (): void => {
  try {
    deleteCookie(storageKey, COOKIE_OPTIONS);
  } catch (error) {
    errorToast(`Impossible de supprimer les jetons : ${error}`);
  }
};

// Cookie legacy pose avec path:"/" avant le scoping au basePath.
// A retirer ~30j apres deploy.
export const removeLegacyTokens = (): void => {
  try {
    deleteCookie(storageKey, { path: "/" });
  } catch (error) {
    errorToast(`Impossible de supprimer les jetons legacy : ${error}`);
  }
};
