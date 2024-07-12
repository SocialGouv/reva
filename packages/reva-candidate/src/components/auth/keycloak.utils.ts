const storageKey = "tokens";

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
}

export const getTokens = (): Tokens | undefined => {
  try {
    const tokensData = localStorage.getItem(storageKey);
    if (tokensData) {
      const tokens = JSON.parse(tokensData);
      return tokens;
    }
  } catch (error) {}

  return undefined;
};

export const saveTokens = (tokens: Tokens): void => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tokens));
  } catch (error) {}
};

export const removeTokens = (): void => {
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {}
};
