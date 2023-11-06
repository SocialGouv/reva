import NextAuth, { AuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import KeycloakProvider, {
  KeycloakProfile,
} from "next-auth/providers/keycloak";
import { OAuthConfig } from "next-auth/providers/oauth";

/**
 * Takes a token, and returns a new token with updated
 * `accessToken` and `accessTokenExpires`. If an error occurs,
 * returns the old token and an error property
 */
async function refreshAccessToken(token: JWT) {
  try {
    const url = `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
    const params = new URLSearchParams({
      client_id: process.env.KEYCLOAK_CLIENT_ID || "",
      client_secret: process.env.KEYCLOAK_CLIENT_SECRET || "",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken as string,
    });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: params,
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + (refreshedTokens.expires_in / 2) * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
      issuer:
        process.env.KEYCLOAK_URL + "/realms/" + process.env.KEYCLOAK_REALM,
      accessTokenUrl: `${process.env.KEYCLOAK_URL}/token`,
      requestTokenUrl: `${process.env.KEYCLOAK_URL}/auth`,
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      // Initial sign in
      if (account && user) {
        return {
          id_token: account.id_token,
          provider: account.provider,
          accessToken: account.access_token,
          accessTokenExpires:
            Date.now() + (account.expires_in as number) * 1000,
          refreshToken: account.refresh_token,
          user,
        };
      }

      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session) {
        session = Object.assign({}, session, {
          accessToken: token.accessToken,
          error: token.error,
        });
      }
      return session;
    },
  },

  events: {
    async signOut({ token }: { token: JWT }) {
      if (token.provider === "keycloak") {
        const issuerUrl = (
          authOptions.providers.find(
            (p) => p.id === "keycloak",
          ) as OAuthConfig<KeycloakProfile>
        ).options!.issuer!;
        const logOutUrl = new URL(
          `${issuerUrl}/protocol/openid-connect/logout`,
        );
        logOutUrl.searchParams.set("id_token_hint", token.id_token as string);
        await fetch(logOutUrl);
      }
    },
  },
};
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
