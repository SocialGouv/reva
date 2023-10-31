import NextAuth, { AuthOptions } from "next-auth";
import { OAuthConfig } from "next-auth/providers/oauth";

const authOptions: AuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || "",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
      issuer: process.env.KEYCLOAK_URL + "/realms/reva",
      accessTokenUrl: `${process.env.KEYCLOAK_URL}/token`,
      requestTokenUrl: `${process.env.KEYCLOAK_URL}/auth`,
    }),
  ],
};
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
