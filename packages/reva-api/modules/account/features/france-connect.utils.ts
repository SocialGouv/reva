const STATE_TTL_MS = 10 * 60 * 1000;
const FC_CODE_TTL_MS = 60 * 1000;

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

type StateValue = {
  nonce: string;
  code_verifier: string;
  certificationId?: string;
  createdAt: number;
};

const stateMap = new Map<string, StateValue>();

export const setState = (
  state: string,
  value: {
    nonce: string;
    code_verifier: string;
    certificationId?: string;
  },
): void => {
  stateMap.set(state, { ...value, createdAt: Date.now() });
};

export const getAndDeleteState = (
  state: string,
): {
  nonce: string;
  code_verifier: string;
  certificationId?: string;
} | null => {
  const entry = stateMap.get(state);
  stateMap.delete(state);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > STATE_TTL_MS) return null;
  return {
    nonce: entry.nonce,
    code_verifier: entry.code_verifier,
    certificationId: entry.certificationId,
  };
};

type FcCodeValue = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  createdAt: number;
};

const fcCodeMap = new Map<string, FcCodeValue>();

export const setFcCode = (
  code: string,
  value: { accessToken: string; refreshToken: string; idToken: string },
): void => {
  fcCodeMap.set(code, { ...value, createdAt: Date.now() });
};

export const getAndDeleteFcCode = (
  code: string,
): { accessToken: string; refreshToken: string; idToken: string } | null => {
  const entry = fcCodeMap.get(code);
  fcCodeMap.delete(code);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > FC_CODE_TTL_MS) return null;
  return {
    accessToken: entry.accessToken,
    refreshToken: entry.refreshToken,
    idToken: entry.idToken,
  };
};
