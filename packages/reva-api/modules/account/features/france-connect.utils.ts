import CryptoJS from "crypto-js";
import { FastifyReply, FastifyRequest } from "fastify";
import { allowInsecureRequests, discovery } from "openid-client";

// Durées de vie des cookies
const STATE_TTL_SECONDS = 10 * 60; // 10 minutes

// Noms des cookies
const FC_STATE_COOKIE = "fc_state";

// Path restreint pour les cookies France Connect
const FC_COOKIE_PATH = "/api/account/franceconnect";

const CERTIFICATION_ID_UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidCertificationId = (
  value: string | undefined,
): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  CERTIFICATION_ID_UUID_REGEX.test(value);

export const getFranceConnectRedirectUri = (): string => {
  const base =
    process.env.API_URL ||
    (process.env.NODE_ENV === "production"
      ? process.env.BASE_URL
      : "http://localhost:8080");
  return new URL("/api/account/franceconnect/callback", base).toString();
};

export const getOAuthConfig = async () => {
  const issuer = `${process.env.KEYCLOAK_ADMIN_URL}/realms/${process.env.KEYCLOAK_APP_REALM}`;
  const clientId = process.env.KEYCLOAK_APP_REVA_APP || "reva-app";
  const clientSecret = process.env.KEYCLOAK_APP_ADMIN_CLIENT_SECRET!;

  const discoveryOptions =
    process.env.NODE_ENV === "development"
      ? { execute: [allowInsecureRequests] }
      : undefined;

  return await discovery(
    new URL(issuer),
    clientId,
    clientSecret,
    undefined,
    discoveryOptions,
  );
};

type FcStateData = {
  state: string;
  nonce: string;
  code_verifier: string;
  certificationId?: string;
};

const encryptData = (data: unknown): string => {
  const dataStr = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(
    dataStr,
    process.env.DATA_ENCRYPT_PRIVATE_KEY!,
  );
  return encrypted.toString();
};

const decryptData = <T>(encrypted: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(
      encrypted,
      process.env.DATA_ENCRYPT_PRIVATE_KEY!,
    );
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return JSON.parse(decrypted) as T;
  } catch {
    return null;
  }
};

const getSecureCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: FC_COOKIE_PATH,
  maxAge,
});

export const setFcStateCookie = (
  reply: FastifyReply,
  data: FcStateData,
): void => {
  const encrypted = encryptData(data);
  reply.setCookie(
    FC_STATE_COOKIE,
    encrypted,
    getSecureCookieOptions(STATE_TTL_SECONDS),
  );
};

export const getAndDeleteFcStateCookie = (
  request: FastifyRequest,
  reply: FastifyReply,
  expectedState: string,
): Omit<FcStateData, "state"> | null => {
  const encrypted = request.cookies[FC_STATE_COOKIE];
  if (!encrypted) return null;

  reply.clearCookie(FC_STATE_COOKIE, { path: FC_COOKIE_PATH });

  const data = decryptData<FcStateData>(encrypted);
  if (!data) return null;

  if (data.state !== expectedState) return null;

  return {
    nonce: data.nonce,
    code_verifier: data.code_verifier,
    certificationId: data.certificationId,
  };
};
