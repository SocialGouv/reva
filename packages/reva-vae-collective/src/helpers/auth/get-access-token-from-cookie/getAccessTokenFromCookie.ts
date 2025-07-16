import { cookies } from "next/headers";

export const getAccessTokenFromCookie = async () => {
  const cookieStore = await cookies();
  const tokens = cookieStore.get("tokens");
  if (!tokens) {
    throw new Error("Session expirée, veuillez vous reconnecter");
  }

  const { accessToken } = JSON.parse(tokens.value);
  return accessToken;
};
