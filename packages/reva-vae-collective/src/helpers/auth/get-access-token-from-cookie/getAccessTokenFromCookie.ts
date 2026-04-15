import { cookies } from "next/headers";

export const getAccessTokenFromCookie = async () => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(
    "VAE_COLLECTIVE_AUTH_TOKENS_ACCESS_TOKEN",
  )?.value;

  return accessToken;
};
