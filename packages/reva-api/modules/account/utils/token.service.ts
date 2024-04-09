import CryptoJS from "crypto-js";
import jwt, { JwtPayload } from "jsonwebtoken";

const TOKEN_LIFETIME_IN_SECONDS = 60;

export type Payload = {
  [key: string]: string;
};

interface TokenServiceInterface {
  getToken(payload: Payload, lifetime?: number): string;
  getPayload(token: string): Payload | undefined;
}

export class TokenService implements TokenServiceInterface {
  private static instance: TokenService;

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }

    return TokenService.instance;
  }

  private constructor() {}

  getToken(payload: Payload, lifetime?: number): string {
    const token = this.generateJwt(payload, lifetime);
    return token;
  }

  private generateJwt = (
    payload: unknown,
    expiresIn: number = TOKEN_LIFETIME_IN_SECONDS,
  ): string => {
    const data = JSON.stringify(payload);
    const cryptedData = CryptoJS.AES.encrypt(
      data,
      process.env.DATA_ENCRYPT_PRIVATE_KEY || "secret",
    );

    const token = jwt.sign(
      { data: cryptedData.toString() },
      process.env.JWT_PRIVATE_KEY || "secret",
      { expiresIn },
    );

    return token;
  };

  getPayload(token: string): Payload | undefined {
    try {
      const tokenData = jwt.verify(
        token,
        process.env.JWT_PRIVATE_KEY || "secret",
      ) as JwtPayload;
      const dataBytes = CryptoJS.AES.decrypt(
        tokenData.data,
        process.env.DATA_ENCRYPT_PRIVATE_KEY || "secret",
      );

      const data = dataBytes.toString(CryptoJS.enc.Utf8);

      const payload = JSON.parse(data);

      return payload;
    } catch (error) {
      console.error(error);
    }
  }
}
