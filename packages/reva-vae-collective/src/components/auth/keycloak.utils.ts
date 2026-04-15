import { setCookie, deleteCookie, getCookie } from "cookies-next";

const STORAGE_KEY = "VAE_COLLECTIVE_AUTH_TOKENS";
const ACCESS_TOKEN_STORAGE_KEY = STORAGE_KEY + "_ACCESS_TOKEN";
const REFRESH_TOKEN_STORAGE_KEY = STORAGE_KEY + "_REFRESH_TOKEN";
const ID_TOKEN_STORAGE_KEY = STORAGE_KEY + "_ID_TOKEN";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

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
    setCookie(ACCESS_TOKEN_STORAGE_KEY, tokens.accessToken);
    setCookie(REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken);
    setCookie(ID_TOKEN_STORAGE_KEY, tokens.idToken);
  } catch (error) {
    console.error(`Impossible de sauvegarder les jetons : ${error}`);
  }
};

export const removeTokens = (): void => {
  try {
    deleteCookie(ACCESS_TOKEN_STORAGE_KEY);
    deleteCookie(REFRESH_TOKEN_STORAGE_KEY);
    deleteCookie(ID_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error(`Impossible de supprimer les jetons : ${error}`);
  }
};
