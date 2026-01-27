export class FranceConnectError extends Error {
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
