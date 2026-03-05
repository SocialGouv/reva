export class FranceConnectError extends Error {
  public idToken?: string;
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "FranceConnectError";
  }
}

export class FranceConnectUserError extends FranceConnectError {
  constructor(message: string, statusCode: number = 401) {
    super(message, statusCode);
    this.name = "FranceConnectUserError";
  }
}

export class FranceConnectSystemError extends FranceConnectError {
  constructor(message: string) {
    super(message, 500);
    this.name = "FranceConnectSystemError";
  }
}

export class FranceConnectForbiddenError extends FranceConnectError {
  constructor(message: string) {
    super(message, 403);
    this.name = "FranceConnectForbiddenError";
  }
}

export const mapToOAuthError = (
  error: unknown,
): { code: string; description: string } => {
  if (error instanceof FranceConnectForbiddenError) {
    return { code: "access_denied", description: error.message };
  }
  if (error instanceof FranceConnectUserError) {
    return { code: "invalid_request", description: error.message };
  }
  if (error instanceof FranceConnectSystemError) {
    return {
      code: "server_error",
      description: "Une erreur technique est survenue",
    };
  }
  return {
    code: "server_error",
    description: "Une erreur inattendue est survenue",
  };
};
