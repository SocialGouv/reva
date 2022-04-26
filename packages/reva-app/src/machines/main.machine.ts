import { assign, createMachine } from "xstate";

import { Certification, Experience, Goal } from "../interface";

const loadingCertifications = "loadingCertifications";
const searchResults = "searchResults";
const searchResultsError = "searchResultsError";
const certificateSummary = "certificateSummary";
const certificateDetails = "certificateDetails";
const projectHome = "projectHome";
const projectExperience = "projectExperience";
const projectExperiences = "projectExperiences";
const projectGoals = "projectGoals";
const submissionHome = "submissionHome";

export type State =
  | typeof loadingCertifications
  | typeof searchResults
  | typeof searchResultsError
  | typeof certificateSummary
  | typeof certificateDetails
  | typeof projectHome
  | typeof projectExperience
  | typeof projectExperiences
  | typeof projectGoals
  | typeof submissionHome;

export interface MainContext {
  error: string;
  certifications: Certification[];
  direction: "previous" | "next";
  showStatusBar: boolean;
  certification?: Certification;
  experiences: Experience[];
  goals: Goal[];
}

export type MainEvent =
  | { type: "SELECT_CERTIFICATION"; certification: Certification }
  | { type: "SHOW_CERTIFICATION_DETAILS"; certification: Certification }
  | { type: "SHOW_PROJECT_HOME"; certification: Certification }
  | { type: "CANDIDATE"; certification: Certification }
  | { type: "ADD_EXPERIENCE" }
  | { type: "EDIT_EXPERIENCES" }
  | { type: "EDIT_GOALS" }
  | { type: "CLOSE_SELECTED_CERTIFICATION" }
  | { type: "BACK" }
  | { type: "LOADED" }
  | { type: "SUBMIT_EXPERIENCE"; experience: Experience }
  | { type: "SUBMIT_EXPERIENCES" }
  | { type: "SUBMIT_GOALS"; goals: Goal[] };

export type MainState =
  | {
      value: typeof searchResults | typeof loadingCertifications;
      context: MainContext & { certification: undefined };
    }
  | {
      value:
        | typeof certificateSummary
        | typeof certificateDetails
        | typeof submissionHome;
      context: MainContext & { certification: Certification };
    }
  | {
      value:
        | typeof projectHome
        | typeof projectGoals
        | typeof projectExperience
        | typeof projectExperiences;

      context: MainContext & {
        certification: Certification;
        experiences: Experience[];
        goals: Goal[];
      };
    };

const initialGoals = [
  { id: "c1", checked: false, label: "Trouver plus facilement un emploi" },
  { id: "c2", checked: false, label: "Être reconnu dans ma profession" },
  { id: "c3", checked: false, label: "Avoir un meilleur salaire" },
  { id: "c4", checked: false, label: "Me réorienter" },
  { id: "c5", checked: false, label: "Consolider mes acquis métier" },
  { id: "c6", checked: false, label: "Me redonner confiance en moi" },
  { id: "c7", checked: false, label: "Autre" },
];

export const mainMachine = createMachine<MainContext, MainEvent, MainState>(
  {
    id: "mainMachine",
    context: {
      error: "",
      direction: "next",
      certifications: [],
      showStatusBar: false,
      experiences: [],
      goals: initialGoals,
    },
    initial: loadingCertifications,
    states: {
      loadingCertifications: {
        invoke: {
          src: "searchCertifications",
          onDone: {
            target: searchResults,
            actions: assign({
              certifications: (_, event) =>
                event.data.data.searchCertificationsAndProfessions
                  .certifications,
            }),
          },
          onError: {
            target: searchResultsError,
            actions: assign({
              error: (_, event) =>
                "Une erreur est survenue lors de la récupération des certifications.",
            }),
          },
        },
      },
      searchResultsError: {},
      searchResults: {
        on: {
          SELECT_CERTIFICATION: {
            target: certificateSummary,
            actions: assign({
              certification: (context, event) => {
                return event.certification;
              },
              error: (context, event) => "",
            }),
          },
        },
      },
      certificateSummary: {
        invoke: {
          src: "getCertification",
          onDone: {
            actions: assign({
              certification: (_, event) => event.data.data.getCertification,
            }),
          },
          onError: {
            actions: assign({
              error: (_, event) =>
                "Une erreur est survenue lors de la récupération de la certification.",
            }),
          },
        },
        on: {
          CANDIDATE: {
            target: submissionHome,
            actions: assign({
              certification: (context, event) => event.certification,
              direction: (context, event) => "next",
            }),
          },
          SHOW_CERTIFICATION_DETAILS: {
            target: certificateDetails,
            actions: assign({
              // certification: (context, event) => {
              //   return event.certification;
              // },
              direction: (context, event) => "next",
            }),
          },
          CLOSE_SELECTED_CERTIFICATION: {
            target: searchResults,
            actions: assign({
              direction: (context, event) => "next",
            }),
          },
        },
      },
      certificateDetails: {
        on: {
          BACK: {
            target: certificateSummary,
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
            }),
          },
          CANDIDATE: {
            target: submissionHome,
            actions: assign({
              certification: (context, event) => {
                return event.certification;
              },
              direction: (context, event) => "next",
            }),
          },
        },
      },
      submissionHome: {
        initial: "loading",
        states: {
          loading: {
            after: {
              2000: { target: "ready" },
            },
          },
          ready: {
            on: {
              BACK: {
                target: "leave",
                actions: assign({
                  certification: (context, event) => context.certification,
                  direction: (context, event) => "previous",
                }),
              },
              SHOW_PROJECT_HOME: {
                target: "leave",
                actions: assign({
                  certification: (context, event) => context.certification,
                  direction: (context, event) => "next",
                }),
              },
            },
          },
          leave: {
            type: "final",
          },
        },
        onDone: [
          {
            cond: (context, event) => {
              return context.direction === "previous";
            },
            target: certificateSummary,
          },
          {
            cond: (context, event) => {
              return context.direction === "next";
            },
            target: projectHome,
          },
        ],
      },
      projectExperience: {
        on: {
          BACK: {
            target: "projectExperiences",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
            }),
          },
          SUBMIT_EXPERIENCE: {
            target: "projectExperiences",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
              experiences: (context, event) => (
                console.log(...context.experiences),
                [...context.experiences, event.experience]
              ),
            }),
          },
        },
      },
      projectExperiences: {
        on: {
          BACK: {
            target: "projectHome",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
            }),
          },
          ADD_EXPERIENCE: {
            target: "projectExperience",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "next",
            }),
          },
          SUBMIT_EXPERIENCES: {
            target: "projectHome",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
            }),
          },
        },
      },
      projectGoals: {
        on: {
          BACK: {
            target: "projectHome",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
            }),
          },
          SUBMIT_GOALS: {
            target: "projectHome",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
              goals: (context, event) => event.goals,
            }),
          },
        },
      },
      projectHome: {
        on: {
          BACK: {
            target: "submissionHome.ready",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
            }),
          },
          EDIT_EXPERIENCES: {
            target: "projectExperiences",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "next",
            }),
          },
          EDIT_GOALS: {
            target: "projectGoals",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "next",
            }),
          },
          CLOSE_SELECTED_CERTIFICATION: {
            target: searchResults,
            actions: assign({
              direction: (context, event) => "previous",
            }),
          },
        },
      },
    },
  },
  {
    services: {
      searchCertifications: (context, event) =>
        Promise.reject("Not implemented"),
      getCertification: (context, event) => Promise.reject("Not implemented"),
    },
  }
);
