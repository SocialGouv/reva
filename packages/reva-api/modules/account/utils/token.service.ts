import { add, isBefore } from "date-fns";
import { v4 } from "uuid";

const TOKEN_LIFETIME_IN_SECONDS = 60;

export type Payload = {
  [key: string]: string;
};

class Token {
  id: string;
  createdAt: Date;
  payload: Payload;
  lifetime?: number;

  constructor(params: { payload: Payload; lifetime?: number }) {
    this.id = v4();
    this.createdAt = new Date();
    this.payload = params.payload;
    this.lifetime = params.lifetime || TOKEN_LIFETIME_IN_SECONDS;
  }

  get isExpired(): boolean {
    const expirationDate = add(this.createdAt, {
      seconds: this.lifetime,
    });

    return isBefore(expirationDate, new Date());
  }
}

interface TokenServiceInterface {
  getTokenId(payload: Payload, lifetime?: number): string;
  getPayload(token: string): Payload | undefined;
}

export class TokenService implements TokenServiceInterface {
  private static instance: TokenService;

  private tokens: Token[] = [];

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }

    return TokenService.instance;
  }

  private constructor() {}

  getTokenId(payload: Payload, lifetime?: number): string {
    const token = new Token({ payload, lifetime });
    this.tokens.push(token);
    return token.id;
  }

  getPayload(tokenId: string): Payload | undefined {
    try {
      const token = this.tokens.find((t) => t.id === tokenId);
      if (!token) {
        throw new Error("Token not found");
      }

      if (token.isExpired) {
        this.invalidToken(token.id);
        throw new Error("Token is expired");
      }

      return token.payload;
    } catch (error) {
      this.invalidToken(tokenId);
      console.error(error);
    }
  }

  invalidToken(tokenId: string): void {
    this.tokens = this.tokens.filter((t) => t.id !== tokenId);
  }
}
