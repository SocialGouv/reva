import { cookies } from "next/headers";

export const getAccessTokenFromCookie = async () => {
  const cookieStore = await cookies();
  const tokens = cookieStore.get("VAE_COLLECTIVE_AUTH_TOKENS");
  if (!tokens) {
    return null;
  }

  const { accessToken } = JSON.parse(tokens.value);
  return accessToken;
};
