export enum FunctionalCodeError {
    TECHNICAL_ERROR = "TECHNICAL_ERROR",
    COMPANION_NOT_FOUND = "COMPANION_NOT_FOUND",
    CANDIDACY_NOT_CREATED = "CANDIDACY_NOT_CREATED",
    CANDIDACY_ALREADY_EXISTS =  "CANDIDACY_ALREADY_EXISTS",
}

export class FunctionalError {
    code: FunctionalCodeError;
    message: string;
    constructor(code: FunctionalCodeError, message: string) {
        this.code = code;
        this.message = message
    }
}