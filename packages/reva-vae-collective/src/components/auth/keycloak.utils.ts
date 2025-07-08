import { setCookie, deleteCookie, getCookie } from "cookies-next";

const storageKey = "tokens";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

export const getTokens = (): Tokens | undefined => {
  try {
    const tokensData = getCookie(storageKey);
    if (tokensData) {
      const tokens = JSON.parse(tokensData as string);
      return tokens;
    }
  } catch (error) {
    console.error(`Impossible de récupérer les jetons : ${error}`);
  }

  return undefined;
};

export const saveTokens = (tokens: Tokens): void => {
  try {
    setCookie(storageKey, JSON.stringify(tokens));
  } catch (error) {
    console.error(`Impossible de sauvegarder les jetons : ${error}`);
  }
};

export const removeTokens = (): void => {
  try {
    deleteCookie(storageKey);
  } catch (error) {
    console.error(`Impossible de supprimer les jetons : ${error}`);
  }
};
