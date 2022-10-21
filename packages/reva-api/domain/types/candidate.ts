export interface Candidate {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
}

export type CANDIDATE_LOGIN_ACTION = "registration" | "login"

export interface CandidateRegistrationInput {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    action: "registration";
}

export interface CandidateLoginInput {
    email: string;
    action: "login";
}

export type CandidateAuthenticationInput = 
    CandidateRegistrationInput
    | CandidateLoginInput
