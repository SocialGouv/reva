import { createJwt } from "../../../utils/jwt.js";

const PROXY_SECRET = process.env.INTEROP_PROXY_SECRET as string;
export const AUTH_API_KEY = process.env.AUTH_API_KEY as string;

const SESSION_ID = "session-http-1";
const KEYCLOAK_ID = "keycloak-http-1";
export const KEYCLOAK_JWT = "keycloak-access-token";

// Session renvoyée par le mock de findSessionById pour le happy path.
export const activeSession = (overrides = {}) => ({
  id: SESSION_ID,
  keycloakId: KEYCLOAK_ID,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  endedAt: null,
  ...overrides,
});

// JWT réel et vérifiable dont le sub est l'id de session.
export const signSessionJwt = (sub = SESSION_ID) =>
  createJwt({ sub, createdAt: new Date("2026-01-01T00:00:00.000Z") });

// Headers pour une route publique (gate proxy uniquement).
export const proxyHeaders = () => ({ "x-interop-secret": PROXY_SECRET });

// Headers pour une route sécurisée (gate proxy + JWT).
export const securedHeaders = (jwt: string) => ({
  "x-interop-secret": PROXY_SECRET,
  authorization: `Bearer ${jwt}`,
});
