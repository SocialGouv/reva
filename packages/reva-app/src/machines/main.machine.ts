import { assign, createMachine } from "xstate";

import { Certification } from "../interface";

const loadingCertifications = "loadingCertifications";
const searchResults = "searchResults";
const searchResultsError = "searchResultsError";
const certificateSummary = "certificateSummary";
const certificateDetails = "certificateDetails";
const projectHome = "projectHome";
const projectGoals = "projectGoals";

export type State =
  | typeof loadingCertifications
  | typeof searchResults
  | typeof searchResultsError
  | typeof certificateSummary
  | typeof certificateDetails
  | typeof projectHome
  | typeof projectGoals;

export interface MainContext {
  error: string;
  certifications: Certification[];
  direction: "previous" | "next";
  showStatusBar: boolean;
  certification?: Certification;
}

export type MainEvent =
  | { type: "SELECT_CERTIFICATION"; certification: Certification }
  | { type: "SHOW_CERTIFICATION_DETAILS"; certification: Certification }
  | { type: "CANDIDATE"; certification: Certification }
  | { type: "SHOW_GOALS" }
  | { type: "CLOSE_SELECTED_CERTIFICATION" }
  | { type: "BACK" }
  | { type: "LOADED" };

export type MainState =
  | {
      value: typeof searchResults | typeof loadingCertifications;
      context: MainContext & { certification: undefined };
    }
  | {
      value:
        | typeof certificateSummary
        | typeof certificateDetails
        | typeof projectHome
        | typeof projectGoals;
      context: MainContext & { certification: Certification };
    };

export const mainMachine = createMachine<MainContext, MainEvent, MainState>(
  {
    id: "mainMachine",
    context: {
      error: "",
      direction: "next",
      certifications: [],
      showStatusBar: false,
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
            target: projectHome,
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
            target: projectHome,
            actions: assign({
              certification: (context, event) => {
                return event.certification;
              },
              direction: (context, event) => "next",
            }),
          },
        },
      },
      projectHome: {
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
              SHOW_GOALS: {
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
            target: projectGoals,
          },
        ],
      },
      projectGoals: {
        on: {
          BACK: {
            target: "projectHome.ready",
            actions: assign({
              certification: (context, event) => context.certification,
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
