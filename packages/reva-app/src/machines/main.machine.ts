import { assign, createMachine } from "xstate";

import { Certification } from "../interface";

const searchResultPage = "search/results";
const certificateSummaryPage = "certificate/summary";
const certificateDetailsPage = "certificate/details";
const projectHomePage = "project/home";
const projectGoalsPage = "project/goals";

export type SearchResultState = { type: typeof searchResultPage };

export type CertificateSummaryState = {
  type: typeof certificateSummaryPage;
  certification: Certification;
};
export type CertificateDetailsState = {
  type: typeof certificateDetailsPage;
  certification: Certification;
};
export type ProjectHomeState = {
  type: typeof projectHomePage;
  certification: Certification;
};
export type ProjectGoalsState = {
  type: typeof projectGoalsPage;
  certification: Certification;
};

export type Page =
  | typeof searchResultPage
  | typeof certificateSummaryPage
  | typeof certificateDetailsPage
  | typeof projectHomePage
  | typeof projectGoalsPage;

type PageState =
  | SearchResultState
  | CertificateSummaryState
  | CertificateDetailsState
  | ProjectHomeState
  | ProjectGoalsState;

export interface MainContext {
  certifications: any[];
  currentPage: PageState;
  direction: "previous" | "next";
  showStatusBar: boolean;
}

export type MainEvent =
  | { type: "NAVIGATE"; page: Page }
  | { type: "SELECT_CERTIFICATION"; certification: Certification }
  | { type: "SHOW_CERTIFICATION_DETAILS"; certification: Certification }
  | { type: "CANDIDATE"; certification: Certification }
  | { type: "SHOW_GOALS" }
  | { type: "CLOSE_SELECTED_CERTIFICATION" }
  | { type: "BACK" }
  | { type: "LOADED" };

export const mainMachine = createMachine<MainContext, MainEvent>({
  id: "mainMachine",
  context: {
    currentPage: {
      type: "search/results",
    },
    direction: "next",
    certifications: [],
    showStatusBar: false,
  },
  initial: "search/results",
  states: {
    "search/results": {
      on: {
        NAVIGATE: {
          target: "certificate/summary",
        },
        SELECT_CERTIFICATION: {
          target: "certificate/summary",
          actions: assign({
            currentPage: (context, event) => {
              return {
                type: "certificate/summary",
                certification: event.certification,
              };
            },
          }),
        },
      },
    },
    "certificate/summary": {
      on: {
        CANDIDATE: {
          target: "project/home",
          actions: assign({
            currentPage: (context, event) => ({
              type: "project/home",
              certification: event.certification,
            }),
            direction: (context, event) => "next",
          }),
        },
        SHOW_CERTIFICATION_DETAILS: {
          target: "certificate/details",
          actions: assign({
            currentPage: (context, event) => ({
              type: "certificate/details",
              certification: event.certification,
            }),
            direction: (context, event) => "next",
          }),
        },
        CLOSE_SELECTED_CERTIFICATION: {
          target: "search/results",
          actions: assign({
            currentPage: (context, event) => ({
              type: "search/results",
            }),
            direction: (context, event) => "next",
          }),
        },
      },
    },
    "certificate/details": {
      on: {
        BACK: {
          target: "certificate/summary",
          actions: assign({
            currentPage: (context, event) => ({
              type: "certificate/summary",
              certification: (context.currentPage as CertificateDetailsState)
                .certification,
            }),
            direction: (context, event) => "previous",
          }),
        },
        CANDIDATE: {
          target: "project/home",
          actions: assign({
            currentPage: (context, event) => ({
              type: "project/home",
              certification: event.certification,
            }),
            direction: (context, event) => "next",
          }),
        },
      },
    },
    "project/home": {
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
                currentPage: (context, event) => ({
                  type: "certificate/summary",
                  certification: (context.currentPage as ProjectHomeState)
                    .certification,
                }),
                direction: (context, event) => "previous",
              }),
            },
            SHOW_GOALS: {
              target: "leave",
              actions: assign({
                currentPage: (context, event) => ({
                  type: "project/goals",
                  certification: (context.currentPage as ProjectHomeState)
                    .certification,
                }),
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
            return context.currentPage.type === "certificate/summary";
          },
          target: "certificate/summary",
        },
        {
          cond: (context, event) => {
            return context.currentPage.type === "project/goals";
          },
          target: "project/goals",
        },
      ],
    },
    "project/goals": {
      on: {
        BACK: {
          target: "project/home.ready",
          actions: assign({
            currentPage: (context, event) => ({
              type: "project/home",
              certification: (context.currentPage as ProjectGoalsState)
                .certification,
            }),
            direction: (context, event) => "previous",
          }),
        },
      },
    },
  },
});
