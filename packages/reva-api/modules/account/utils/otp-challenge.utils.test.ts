import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

import {
  decodeOtpChallengeToken,
  encodeOtpChallengeToken,
  OTP_CHALLENGE_TTL_SECONDS,
} from "./otp-challenge.utils";

const ORIGINAL_ENV = { ...process.env };

beforeAll(() => {
  process.env.JWT_PRIVATE_KEY = "test-jwt-private-key";
  process.env.DATA_ENCRYPT_PRIVATE_KEY = "test-data-encrypt-private-key";
});

afterAll(() => {
  process.env = { ...ORIGINAL_ENV };
});

// Construit un JWT signé+chiffré avec les clés de test, en court-circuitant
// `encodeOtpChallengeToken` pour pouvoir injecter un payload arbitraire
// (payload incomplet, clientApp invalide, etc.).
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
      clientApp: "REVA_ADMIN" as const,
      password: "s3cret-p@ss",
    };

    const decoded = decodeOtpChallengeToken(encodeOtpChallengeToken(payload));
    expect(decoded).toEqual(payload);
  });

  test("le décodage d'un token expiré renvoie null", () => {
    const payload = {
      keycloakId: "kc-id-2",
      clientApp: "REVA_VAE_COLLECTIVE" as const,
      password: "another-pwd",
    };

    const expiredToken = encodeOtpChallengeToken(payload);
    // Avance l'horloge de TTL + 1s pour forcer l'expiration JWT.
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + (OTP_CHALLENGE_TTL_SECONDS + 1) * 1000);

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

  test("le décodage d'un token avec un clientApp inconnu renvoie null", () => {
    const token = signWithArbitraryPayload({
      keycloakId: "kc-id",
      clientApp: "BOGUS",
      password: "p@ss",
    });
    expect(decodeOtpChallengeToken(token)).toBeNull();
  });
});
