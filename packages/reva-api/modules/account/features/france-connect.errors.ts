export class FranceConnectError extends Error {
  public idToken?: string;
  public userMessage: string;
  public statusCode: number;

  constructor({
    message,
    statusCode,
    userMessage,
  }: {
    message: string;
    statusCode: number;
    userMessage?: string;
  }) {
    super(message);
    this.name = "FranceConnectError";
    this.statusCode = statusCode;
    this.userMessage = userMessage ?? message;
  }
}

export class FranceConnectUserError extends FranceConnectError {
  constructor({
    message,
    statusCode = 401,
    userMessage,
  }: {
    message: string;
    statusCode?: number;
    userMessage?: string;
  }) {
    super({ message, statusCode, userMessage });
    this.name = "FranceConnectUserError";
  }
}

export class FranceConnectReconciliationError extends FranceConnectUserError {
  constructor({
    candidateId,
    mismatchedFields,
    birthdateDb,
    birthdateFc,
  }: {
    candidateId: string;
    mismatchedFields: string[];
    // log temporaire : diagnostic des mismatchs de birthdate post-fix TZ
    birthdateDb?: string | null;
    birthdateFc?: string;
  }) {
    const birthdateLog = mismatchedFields.includes("birthdate")
      ? ` (DB: ${birthdateDb ?? "null"}, FC: ${birthdateFc ?? "null"}, TZ: ${process.env.TZ ?? "unset"})`
      : "";

    super({
      message: `Échec de réconciliation pour le candidat ${candidateId} : champs non-correspondants [${mismatchedFields.join(", ")}]${birthdateLog}`,
      statusCode: 401,
      userMessage:
        "Les informations d'identité ne correspondent pas au compte existant. Connectez-vous avec vos identifiants habituels pour vérifier vos informations, ou contactez le support.",
    });
    this.name = "FranceConnectReconciliationError";
  }
}

export class FranceConnectSystemError extends FranceConnectError {
  constructor({ message }: { message: string }) {
    super({ message, statusCode: 500 });
    this.name = "FranceConnectSystemError";
  }
}

export class FranceConnectForbiddenError extends FranceConnectError {
  constructor({
    message,
    userMessage,
  }: {
    message: string;
    userMessage?: string;
  }) {
    super({ message, statusCode: 403, userMessage });
    this.name = "FranceConnectForbiddenError";
  }
}

export const mapToOAuthError = (
  error: unknown,
): { code: string; description: string } => {
  if (error instanceof FranceConnectForbiddenError) {
    return { code: "access_denied", description: error.userMessage };
  }
  if (error instanceof FranceConnectUserError) {
    return { code: "invalid_request", description: error.userMessage };
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
