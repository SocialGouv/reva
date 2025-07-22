import { cookies } from "next/headers";

export const getAccessTokenFromCookie = async () => {
  const cookieStore = await cookies();
  const tokens = cookieStore.get("VAE_COLLECTIVE_AUTH_TOKENS");
  if (!tokens) {
    throw new Error("Session expirée, veuillez vous reconnecter");
  }

  const { accessToken } = JSON.parse(tokens.value);
  return accessToken;
};
