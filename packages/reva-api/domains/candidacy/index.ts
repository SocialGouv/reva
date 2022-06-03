import { Either, EitherAsync, Left, Right } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../FunctionalError";

export type Duration =
    | "unknown"
    | "lessThanOneYear"
    | "betweenOneAndThreeYears"
    | "moreThanThreeYears"
    | "moreThanFiveYears"
    | "moreThanTenYears";

export interface CandidacyInput {
    deviceId: string;
    certificationId: string;
    companionId: string | null;
    experiences: Experience[];
    goals: Goal[];
    phone: string | null;
    email: string | null;
}

export interface Candidacy extends CandidacyInput {
    id: string;
    candidacyStatuses: CandidacyStatus[];
    createdAt: Date;
}

export interface CandidacySummary extends Omit<Candidacy, 'experiences' | 'goals'| 'candidacyStatuses'> {
    id: string;
    certification: any;
    lastStatus: CandidacyStatus;
    createdAt: Date;
}

export interface CandidacyStatus {
    id: string;
    status: string;
    createdAt: Date;
}

export interface ExperienceInput {
    title: string;
    startedAt: Date;
    duration: Duration;
    description: string;
}


export interface Experience extends ExperienceInput {
    id: string;
}

export interface Goal {
    goalId: string;
    additionalInformation: string | null;
}

export interface Companion {
    id: string;
}

interface CreateCandidacyDeps {
    createCandidacy: (params: { deviceId: string; certificationId: string; }) => Promise<Either<string, Candidacy>>;
    getCandidacyFromDeviceId: (deviceId: string) => Promise<Either<string, Candidacy>>;
}

export const createCandidacy = (deps: CreateCandidacyDeps) => async (params: { deviceId: string; certificationId: string; }): Promise<Either<FunctionalError, Candidacy>> => {
    const checkIfCandidacyAlreadyExists = 
        EitherAsync.fromPromise(() => deps.getCandidacyFromDeviceId(params.deviceId))
            .swap()
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_ALREADY_EXISTS, `Une candidature existe déjà pour cet appareil`));

    const createCandidacy = EitherAsync.fromPromise(() => deps.createCandidacy(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_NOT_CREATED, `Erreur lors de la creation de la candidature`));

    return checkIfCandidacyAlreadyExists
        .chain(() => createCandidacy);
};


interface GetCandidacyDeps {
    getCandidacyFromDeviceId: (deviceId: string) => Promise<Either<string, Candidacy>>;
}

export const getCandidacyFromDeviceId = (deps: GetCandidacyDeps) => (params: { deviceId: string; }): Promise<Either<FunctionalError, Candidacy>> => 
    EitherAsync.fromPromise(() => deps.getCandidacyFromDeviceId(params.deviceId))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST, `Aucune candidature n'a été trouvé`)).run();


interface GetCompanionsDeps {
    getCompanions: () => Promise<Either<string, Companion[]>>;
}

export const getCompanions = (deps: GetCompanionsDeps) => async () => 
    EitherAsync.fromPromise(() => deps.getCompanions())
        .mapLeft(() => Left(new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, 'Erreur lors de la récupération des accompagnants'))).run();

interface AddExperienceDeps {
    createExperience: (params: {
        candidacyId: string;
        experience: ExperienceInput;
    }) => Promise<Either<string, Experience>>;
    getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const addExperience = (deps: AddExperienceDeps) => (params: {
    candidacyId: string,
    experience: ExperienceInput;
}) => {
    const checkIfCandidacyExists = 
        EitherAsync.fromPromise(() => deps.getCandidacyFromId(params.candidacyId))
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST, `Aucune candidature n'a été trouvé`));

    const createExperience = EitherAsync.fromPromise(() => deps.createExperience(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.EXPERIENCE_NOT_CREATED, `Erreur lors de la creation de l'expérience`));


    return checkIfCandidacyExists
        .chain(() => createExperience);
};


interface UpdateExperienceDeps {
    updateExperience: (params: {
        candidacyId: string;
        experienceId: string;
        experience: ExperienceInput;
    }) => Promise<Either<string, Experience>>;
    getExperienceFromId: (id: string) => Promise<Either<string, Experience>>;
    getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}


export const updateExperience = (deps: UpdateExperienceDeps) => (params: {
    candidacyId: string,
    experienceId: string;
    experience: ExperienceInput;
}) => {
    const checkIfCandidacyExists = 
        EitherAsync.fromPromise(() => deps.getCandidacyFromId(params.candidacyId))
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST, `Aucune candidature n'a été trouvé`));

    const checkIfExperienceExists = 
        EitherAsync.fromPromise(() => deps.getExperienceFromId(params.experienceId))
            .mapLeft(() => new FunctionalError(FunctionalCodeError.EXPERIENCE_DOES_NOT_EXIST, `Aucune expérience n'a été trouvé`));

    const updateExperience = EitherAsync.fromPromise(() => deps.updateExperience(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.EXPERIENCE_NOT_UPDATED, `Erreur lors de la mise à jour de l'expérience`));


    return checkIfCandidacyExists
        .chain(() => checkIfExperienceExists)
        .chain(() => updateExperience);
};


interface UpdateGoalsDeps {
    updateGoals: (params: {
        candidacyId: string;
        goals: Goal[];
    }) => Promise<Either<string, number>>;
    getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}


export const updateGoals = (deps: UpdateGoalsDeps) => (params: {
    candidacyId: string,
    goals: Goal[];
}) => {
    const checkIfCandidacyExists = 
        EitherAsync.fromPromise(() => deps.getCandidacyFromId(params.candidacyId))
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST, `Aucune candidature n'a été trouvé`));

    const updateGoals = EitherAsync.fromPromise(() => deps.updateGoals(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.GOALS_NOT_UPDATED, `Erreur lors de la mise à jour des objectifs`));


    return checkIfCandidacyExists
        .chain(() => updateGoals);
};



interface UpdateContactDeps {
    updateContact: (params: {
        candidacyId: string;
        email: string;
        phone: string;
    }) => Promise<Either<string, Candidacy>>;
    getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const updateContact = (deps: UpdateContactDeps) => (params: {
    candidacyId: string;
    email: string;
    phone: string;
}) => {
    // TODO Check mail format
    const checkIfCandidacyExists = 
        EitherAsync.fromPromise(() => deps.getCandidacyFromId(params.candidacyId))
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST, `Aucune candidature n'a été trouvé`));

    const updateContact = EitherAsync.fromPromise(() => deps.updateContact(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.GOALS_NOT_UPDATED, `Erreur lors de la mise à jour du contact`));


    return checkIfCandidacyExists
        .chain(() => updateContact);
};

interface SubmitCandidacyDeps {
    updateCandidacyStatus: (params: {
        candidacyId: string;
        status: "VALIDATION";
    }) => Promise<Either<string, Candidacy>>;
    getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const submitCandidacy = (deps: SubmitCandidacyDeps) => (params: {
    candidacyId: string;
}) => {
    // TODO Check if a candidacy does not already exist with status VALIDATION
    const checkIfCandidacyExists = 
        EitherAsync.fromPromise(() => deps.getCandidacyFromId(params.candidacyId))
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST, `Aucune candidature n'a été trouvé`));

    const updateContact = EitherAsync.fromPromise(() => deps.updateCandidacyStatus({candidacyId: params.candidacyId, status: "VALIDATION"}))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.STATUS_NOT_UPDATED, `Erreur lors de la mise à jour du status`));


    return checkIfCandidacyExists
        .chain(() => updateContact);
};

interface UpdateCertificationDeps {
    updateCertification: (params: {
        candidacyId: string;
        certificationId: string;
    }) => Promise<Either<string, Candidacy>>;
    getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const updateCertification = (deps: UpdateCertificationDeps) => (params: {
    candidacyId: string;
    certificationId: string;
}) => {
    // TODO Check mail format
    const checkIfCandidacyExists = 
        EitherAsync.fromPromise(() => deps.getCandidacyFromId(params.candidacyId))
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST, `Aucune candidature n'a été trouvé`));

    const updateCertification = EitherAsync.fromPromise(() => deps.updateCertification(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.GOALS_NOT_UPDATED, `Erreur lors de la mise à jour de la certification`));


    return checkIfCandidacyExists
        .chain(() => updateCertification);
};

interface GetCandidaciesDeps {
    getCandidacies: () => Promise<Either<string, CandidacySummary[]>>;
}

export const getCandidacies = (deps: GetCandidaciesDeps) => (params : {
    role: string
}) => {
    const candidacies = EitherAsync.fromPromise(() => deps.getCandidacies())
        .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACIES_NOT_FOUND, `Erreur lors de la récupération des candidatures`));
    return candidacies
}

interface DeleteCandidacyDeps {
    deleteCandidacyFromId: (
        candidacyId: string
    ) => Promise<Either<string, string>>;
}

export const deleteCandidacy = (deps: DeleteCandidacyDeps) => (params : {
    candidacyId: string
}) => {
    const result = EitherAsync.fromPromise(() => deps.deleteCandidacyFromId(params.candidacyId))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACIES_NOT_DELETE, `Erreur lors de la suppression de la candidature ${params.candidacyId}`));
    return result
}
