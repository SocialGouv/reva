import { assign, createMachine } from "xstate";

import { Certification } from "../interface";

const searchResults = "searchResults";
const certificateSummary = "certificateSummary";
const certificateDetails = "certificateDetails";
const projectHome = "projectHome";
const projectGoals = "projectGoals";

export type State =
  | typeof searchResults
  | typeof certificateSummary
  | typeof certificateDetails
  | typeof projectHome
  | typeof projectGoals;

export interface MainContext {
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
      value: typeof searchResults;
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

export const mainMachine = createMachine<MainContext, MainEvent, MainState>({
  id: "mainMachine",
  context: {
    direction: "next",
    certifications: [],
    showStatusBar: false,
  },
  initial: searchResults,
  states: {
    searchResults: {
      on: {
        SELECT_CERTIFICATION: {
          target: certificateSummary,
          actions: assign({
            certification: (context, event) => {
              return event.certification;
            },
          }),
        },
      },
    },
    certificateSummary: {
      on: {
        CANDIDATE: {
          target: projectHome,
          actions: assign({
            certification: (context, event) => {
              return event.certification;
            },
            direction: (context, event) => "next",
          }),
        },
        SHOW_CERTIFICATION_DETAILS: {
          target: certificateDetails,
          actions: assign({
            certification: (context, event) => {
              return event.certification;
            },
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
});
