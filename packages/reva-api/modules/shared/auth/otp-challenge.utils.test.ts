import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

import {
  decodeOtpChallengeToken,
  encodeOtpChallengeToken,
} from "./otp-challenge.utils";

const ORIGINAL_ENV = { ...process.env };
const AUTHENTICATOR_OTP_CHALLENGE_EXPIRES_IN = 5 * 60;

beforeAll(() => {
  process.env.JWT_PRIVATE_KEY = "test-jwt-private-key";
  process.env.DATA_ENCRYPT_PRIVATE_KEY = "test-data-encrypt-private-key";
});

afterAll(() => {
  process.env = { ...ORIGINAL_ENV };
});

// Construit un JWT signé+chiffré avec les clés de test, en court-circuitant
// `encodeOtpChallengeToken` pour pouvoir injecter un payload arbitraire
// (payload incomplet, champ manquant, etc.).
const signWithArbitraryPayload = (rawPayload: unknown): string => {
  const cryptedData = CryptoJS.AES.encrypt(
    JSON.stringify(rawPayload),
    process.env.DATA_ENCRYPT_PRIVATE_KEY!,
  ).toString();
  return jwt.sign({ data: cryptedData }, process.env.JWT_PRIVATE_KEY!, {
    expiresIn: 60,
  });
};

describe("otp-challenge.utils", () => {
  test("l'encodage puis le décodage redonne le payload original", () => {
    const payload = {
      keycloakId: "kc-id-1",
      realm: "reva-admin",
      clientId: "reva-admin",
      password: "s3cret-p@ss",
    };

    const decoded = decodeOtpChallengeToken(
      encodeOtpChallengeToken({
        payload,
        otpType: "authenticator",
      }),
    );
    expect(decoded).toEqual(payload);
  });

  test("le décodage d'un token expiré renvoie null", () => {
    const payload = {
      keycloakId: "kc-id-2",
      realm: "reva-app",
      clientId: "reva-app",
      password: "another-pwd",
    };

    const expiredToken = encodeOtpChallengeToken({
      payload,
      otpType: "authenticator",
    });
    // Avance l'horloge de TTL + 1s pour forcer l'expiration JWT.
    vi.useFakeTimers();
    vi.setSystemTime(
      Date.now() + (AUTHENTICATOR_OTP_CHALLENGE_EXPIRES_IN + 1) * 1000,
    );

    try {
      const decoded = decodeOtpChallengeToken(expiredToken);
      expect(decoded).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  test("le décodage d'un token signé avec une autre clé renvoie null", () => {
    const foreignToken = jwt.sign({ data: "garbage" }, "other-key", {
      expiresIn: 60,
    });
    expect(decodeOtpChallengeToken(foreignToken)).toBeNull();
  });

  test("le décodage d'un token au payload incomplet renvoie null", () => {
    const token = signWithArbitraryPayload({ foo: "bar" });
    expect(decodeOtpChallengeToken(token)).toBeNull();
  });

  test("le décodage d'un token sans champ realm renvoie null", () => {
    const token = signWithArbitraryPayload({
      keycloakId: "kc-id",
      clientId: "reva-admin",
      password: "p@ss",
    });
    expect(decodeOtpChallengeToken(token)).toBeNull();
  });

  test("le décodage d'un token sans champ clientId renvoie null", () => {
    const token = signWithArbitraryPayload({
      keycloakId: "kc-id",
      realm: "reva-admin",
      password: "p@ss",
    });
    expect(decodeOtpChallengeToken(token)).toBeNull();
  });
});
