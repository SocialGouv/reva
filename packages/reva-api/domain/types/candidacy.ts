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

export interface CandidacyStatus {
    id: string;
    status: string;
    createdAt: Date;
}

export interface CandidacySummary extends Omit<Candidacy, 'experiences' | 'goals' | 'candidacyStatuses'> {
    id: string;
    certification: any;
    lastStatus: CandidacyStatus;
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

export type Duration =
    | "unknown"
    | "lessThanOneYear"
    | "betweenOneAndThreeYears"
    | "moreThanThreeYears"
    | "moreThanFiveYears"
    | "moreThanTenYears";

export type CandidateTypology =
    | "NON_SPECIFIE"
    | "SALARIE_PRIVE"
    | "SALARIE_PUBLIC_HOSPITALIER"
    | "DEMANDEUR_EMPLOI"
    | "AIDANTS_FAMILIAUX"
    | "AUTRE";


export interface Goal {
    goalId: string;
    additionalInformation: string | null;
}

export interface Companion {
    id: string;
}

export interface AppointmentInformations {
    firstAppointmentOccuredAt: Date;
    appointmentCount: number;
    wasPresentAtFirstAppointment: boolean;
};