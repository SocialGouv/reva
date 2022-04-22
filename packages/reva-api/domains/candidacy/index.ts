import { Either, EitherAsync, Left } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../FunctionalError";

export interface CandidacyInput {
    deviceId: string;
    companionId: string;
    experiences: Experience[];
    goals: Goal[];
}

export interface Candidacy extends CandidacyInput {
    id: string;
}

export interface Experience {
    label: string;
    startedAt: Date;
    duration: number;
    description: string;
}

export interface Goal {
    goalId: string;
    additionalInformation: string;
}

export interface Companion {
    id: string;
}

interface CreateCandidacyDeps {
    existsCompanion: (companionId: string) => Promise<Either<string, Companion>>;
    createCandidacy: (params: { candidacy: CandidacyInput; }) => Promise<Either<string, Candidacy>>;
    getCandidacyFromDeviceId: (deviceId: string) => Promise<Either<string, Candidacy>>;
}

export const createCandidacy = (deps: CreateCandidacyDeps) => async (params: { candidacy: CandidacyInput; }): Promise<Either<FunctionalError, Candidacy>> => {
    const checkIfCandidacyAlreadyExists = 
        EitherAsync.fromPromise(() => deps.getCandidacyFromDeviceId(params.candidacy.deviceId))
            .swap()
            .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_ALREADY_EXISTS, `Une candidature existe déjà pour cet appareil`));

    const checkIfCompanionExist = EitherAsync.fromPromise(() => deps.existsCompanion(params.candidacy.companionId))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.COMPANION_NOT_FOUND, `Accompagnateur inexistant`));

    const createCandidacy = EitherAsync.fromPromise(() => deps.createCandidacy(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.CANDIDACY_NOT_CREATED, `Erreur lors de la creation de la candidature`));

    return checkIfCandidacyAlreadyExists
        .chain(() => checkIfCompanionExist)
        .chain(() => createCandidacy);
};


interface GetCandidacyDeps {
    getCandidacyFromDeviceId: (deviceId: string) => Promise<Either<string, Candidacy>>;
}

export const getCandidacyFromDeviceId = (deps: GetCandidacyDeps) => (params: { deviceId: string; }): Promise<Either<string, Candidacy>> => 
    EitherAsync.fromPromise(() => deps.getCandidacyFromDeviceId(params.deviceId)).run();


interface GetCompanionsDeps {
    getCompanions: () => Promise<Either<string, Companion[]>>;
}

export const getCompanions = (deps: GetCompanionsDeps) => async () => 
    EitherAsync.fromPromise(() => deps.getCompanions())
        .mapLeft(() => Left(new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, 'Erreur lors de la récupération des accompagnants'))).run();

export const selectCompanion = (props: any) => (props: any) => {};
export const getExperiences = (props: any) => (props: any) => {};
export const addExperience = (props: any) => (props: any) => {};
export const editExperience = (props: any) => (props: any) => {};
export const addGoal = (props: any) => (props: any) => {}
