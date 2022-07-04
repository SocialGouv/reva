export enum FunctionalCodeError {
    TECHNICAL_ERROR = "TECHNICAL_ERROR",
    COMPANION_NOT_FOUND = "COMPANION_NOT_FOUND",
    CANDIDACY_NOT_CREATED = "CANDIDACY_NOT_CREATED",
    CANDIDACY_ALREADY_EXISTS =  "CANDIDACY_ALREADY_EXISTS",
    CANDIDACY_DOES_NOT_EXIST =  "CANDIDACY_DOES_NOT_EXIST",
    EXPERIENCE_DOES_NOT_EXIST = "EXPERIENCE_DOES_NOT_EXIST",
    EXPERIENCE_NOT_CREATED = "EXPERIENCE_NOT_CREATED",
    EXPERIENCE_NOT_UPDATED = "EXPERIENCE_NOT_UPDATED",
    GOALS_NOT_UPDATED = "GOALS_NOT_UPDATED",
    STATUS_NOT_UPDATED = "STATUS_NOT_UPDATED",
    CONTACT_NOT_UPDATED = "CONTACT_NOT_UPDATED",
    CANDIDACIES_NOT_FOUND = "CANDIDACIES_NOT_FOUND",
    CANDIDACIES_NOT_DELETED = "CANDIDACIES_NOT_DELETED",
    CANDIDACIES_NOT_ARCHIVED = "CANDIDACIES_NOT_ARCHIVED",
    MEETING_INFORMATIONS_NOT_SAVED = "MEETING_INFORMATIONS_NOT_SAVED",
}

export class FunctionalError {
    code: FunctionalCodeError;
    message: string;
    constructor(code: FunctionalCodeError, message: string) {
        this.code = code;
        this.message = message
    }
}