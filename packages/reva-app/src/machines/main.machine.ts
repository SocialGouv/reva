import { assign, createMachine } from "xstate";

import { Direction } from "../components/organisms/Page";
import {
  Certification,
  Contact,
  Experience,
  Experiences,
  Goal,
} from "../interface";

const loadingApplicationData = "loadingApplicationData";
const loadingCertifications = "loadingCertifications";
const searchResults = "searchResults";
const searchResultsError = "searchResultsError";
const certificateSummary = "certificateSummary";
const certificateDetails = "certificateDetails";
const projectHome = "projectHome";
const projectContact = "projectContact";
const projectExperience = "projectExperience";
const projectExperiences = "projectExperiences";
const projectGoals = "projectGoals";
const projectHelp = "projectHelp";
const projectSubmitted = "projectSubmitted";
const submissionHome = "submissionHome";
const error = "error";

export type State =
  | typeof loadingApplicationData
  | typeof loadingCertifications
  | typeof searchResults
  | typeof searchResultsError
  | typeof certificateSummary
  | typeof certificateDetails
  | typeof projectHome
  | typeof projectContact
  | typeof projectExperience
  | typeof projectExperiences
  | typeof projectGoals
  | typeof projectSubmitted
  | typeof submissionHome;

type ProjectStatus = "draft" | "validated" | "submitted";

export interface MainContext {
  error: string;
  candidacyId?: string;
  certifications: Certification[];
  candidacyCreatedAt?: Date;
  contact?: Contact;
  direction: Direction;
  showStatusBar: boolean;
  certification?: Certification;
  experiences: Experiences;
  goals: Goal[];
  projectStatus?: ProjectStatus;
}

export type MainEvent =
  | { type: "SELECT_CERTIFICATION"; certification: Certification }
  | { type: "SHOW_CERTIFICATION_DETAILS"; certification: Certification }
  | { type: "SHOW_PROJECT_HOME"; certification: Certification }
  | { type: "EDIT_CONTACT" }
  | { type: "ADD_EXPERIENCE" }
  | { type: "EDIT_EXPERIENCES" }
  | { type: "EDIT_EXPERIENCE"; index: number }
  | { type: "EDIT_GOALS" }
  | { type: "CLOSE_SELECTED_CERTIFICATION" }
  | { type: "BACK" }
  | { type: "LOADED" }
  | { type: "OPEN_HELP" }
  | { type: "SUBMIT_CERTIFICATION"; certification: Certification }
  | { type: "SUBMIT_CONTACT"; contact: Contact }
  | { type: "SUBMIT_EXPERIENCE"; experience: Experience }
  | { type: "SUBMIT_EXPERIENCES" }
  | { type: "SUBMIT_GOALS"; goals: Goal[] }
  | { type: "VALIDATE_PROJECT" }
  | { type: "SUBMIT_PROJECT" };

export type MainState =
  | {
      value:
        | typeof searchResults
        | typeof loadingCertifications
        | typeof loadingApplicationData;
      context: MainContext & {
        certification: undefined;
        candidacyId: undefined;
      };
    }
  | {
      value: typeof certificateSummary | typeof certificateDetails;
      context: MainContext & {
        certification: Certification;
        candidacyId: string;
      };
    }
  | {
      value: typeof submissionHome;
      context: MainContext & {
        candidacyId: string;
        certification: Certification;
        candidacyCreatedAt: Date;
      };
    }
  | {
      value:
        | typeof projectHome
        | typeof projectSubmitted
        | typeof projectGoals
        | typeof projectContact
        | typeof projectExperience
        | typeof projectExperiences
        | typeof projectHelp
        | typeof error;

      context: MainContext & {
        candidacyId: string;
        certification: Certification;
        contact: Contact;
        experiences: Experience[];
        goals: Goal[];
        projectStatus?: ProjectStatus;
      };
    };

const isNewCandidacy = (context: MainContext, event: MainEvent) => {
  return context.candidacyId === undefined;
};

export const mainMachine = createMachine<MainContext, MainEvent, MainState>(
  {
    id: "mainMachine",
    context: {
      error: "",
      direction: "initial",
      certifications: [],
      showStatusBar: false,
      experiences: { rest: [] },
      goals: [],
      projectStatus: "draft",
    },
    initial: loadingApplicationData,
    states: {
      loadingApplicationData: {
        invoke: {
          src: "initializeApp",
          onDone: [
            {
              cond: (context, event) => {
                return event.data.candidacy;
              },
              target: "submissionHome.ready",
              actions: assign({
                candidacyId: (_, event) => {
                  return event.data.candidacy.id;
                },
                candidacyCreatedAt: (_, event) => {
                  return new Date(event.data.candidacy.createdAt);
                },
                certification: (_, event) => {
                  return event.data.candidacy.certification;
                },
                experiences: (_, event) => {
                  return { rest: event.data.candidacy.experiences };
                },
                goals: (_, event) => {
                  return event.data.candidacy.goals;
                },
                contact: (_, event) => {
                  return {
                    email: event.data.candidacy.email,
                    phone: event.data.candidacy.phone,
                  };
                },
                projectStatus: (_, event) => {
                  return event.data.candidacy.candidacyStatuses
                    .map((s: { status: string }) => s.status)
                    .includes("VALIDATION")
                    ? "submitted"
                    : "draft";
                },
              }),
            },
            {
              cond: (context, event) =>
                event.data.graphQLErrors[0]?.extensions.code ===
                "CANDIDACY_DOES_NOT_EXIST",
              target: loadingCertifications,
              actions: assign({
                goals: (_, event) => event.data.referentials.goals,
              }),
            },
          ],
          onError: [
            {
              target: error,
              actions: assign({
                error: (_, event) => {
                  return "Une erreur est survenue lors de la r??cup??ration de la candidature.";
                },
              }),
            },
          ],
        },
      },
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
                "Une erreur est survenue lors de la r??cup??ration des certifications.",
            }),
          },
        },
      },
      error: {},
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
                "Une erreur est survenue lors de la r??cup??ration de la certification.",
            }),
          },
        },
        on: {
          SHOW_CERTIFICATION_DETAILS: {
            target: certificateDetails,
            actions: ["navigateNext"],
          },
          CLOSE_SELECTED_CERTIFICATION: {
            target: searchResults,
            actions: ["navigateNext"],
          },
        },
        initial: "idle",
        states: {
          idle: {
            on: {
              SUBMIT_CERTIFICATION: [
                {
                  target: "leave",
                  actions: [
                    "navigateNext",
                    assign((context, event) => ({
                      certification: event.certification,
                    })),
                  ],
                  cond: isNewCandidacy,
                },
                {
                  target: "submittingChange",
                  actions: [
                    "navigateNext",
                    assign((context, event) => ({
                      certification: event.certification,
                    })),
                  ],
                },
              ],
            },
          },
          submittingChange: {
            invoke: {
              src: "updateCertification",
              onDone: {
                target: "leave",
              },
              onError: {
                target: "retry",
                actions: assign({
                  error: (_, event) =>
                    "Une erreur est survenue lors de la mise ?? jour de la certification.",
                }),
              },
            },
          },
          retry: {
            on: {
              SUBMIT_CERTIFICATION: {
                target: "leave",
                actions: [
                  "navigateNext",
                  assign((context, event) => ({
                    certification: event.certification,
                  })),
                ],
                cond: isNewCandidacy,
              },
            },
          },
          leave: {
            type: "final",
          },
        },
        onDone: [
          {
            cond: (context, event) => context.candidacyId === undefined,
            target: "submissionHome",
          },
          {
            target: "projectHome",
          },
        ],
      },
      certificateDetails: {
        on: {
          BACK: {
            target: certificateSummary,
            actions: ["navigatePrevious"],
          },
        },
        initial: "idle",
        states: {
          idle: {
            on: {
              SUBMIT_CERTIFICATION: [
                {
                  target: "leave",
                  actions: [
                    "navigateNext",
                    assign((context, event) => ({
                      certification: event.certification,
                    })),
                  ],
                  cond: isNewCandidacy,
                },
                {
                  target: "submittingChange",
                  actions: [
                    "navigateNext",
                    assign((context, event) => ({
                      certification: event.certification,
                    })),
                  ],
                },
              ],
            },
          },
          submittingChange: {
            invoke: {
              src: "updateCertification",
              onDone: {
                target: "leave",
              },
              onError: {
                target: "retry",
                actions: assign({
                  error: (_, event) =>
                    "Une erreur est survenue lors de la mise ?? jour de la certification.",
                }),
              },
            },
          },
          retry: {
            on: {
              SUBMIT_CERTIFICATION: {
                target: "leave",
                actions: [
                  "navigateNext",
                  assign((context, event) => ({
                    certification: event.certification,
                  })),
                ],
                cond: isNewCandidacy,
              },
            },
          },
          leave: {
            type: "final",
          },
        },
        onDone: [
          {
            cond: (context, event) => context.candidacyId === undefined,
            target: "submissionHome",
          },
          {
            target: "projectHome",
          },
        ],
      },
      submissionHome: {
        initial: "loading",
        states: {
          loading: {
            invoke: {
              src: "saveCertification",
              onDone: {
                target: "ready",
                actions: assign({
                  candidacyId: (_, event) =>
                    event.data.data.candidacy_createCandidacy.id,
                  candidacyCreatedAt: (_, event) =>
                    new Date(
                      event.data.data.candidacy_createCandidacy.createdAt
                    ),
                }),
              },
              onError: {
                target: "retry",
                actions: assign({
                  error: (_, event) =>
                    "Une erreur est survenue lors de l'enregistrement de la certification.",
                  direction: (context, event) => "next",
                }),
              },
            },
          },
          retry: {
            on: {
              SUBMIT_CERTIFICATION: { target: "loading" },
            },
          },
          ready: {
            on: {
              BACK: {
                target: "leave",
                actions: ["navigatePrevious"],
              },
              SHOW_PROJECT_HOME: {
                target: "leave",
                actions: ["navigateNext"],
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
      projectContact: {
        initial: "idle",
        states: {
          idle: {
            on: {
              BACK: {
                target: "leave",
                actions: ["navigatePrevious"],
              },
              SUBMIT_CONTACT: {
                target: "submitting",
                actions: ["navigatePrevious"],
              },
            },
          },
          error: {
            on: {
              BACK: {
                target: "leave",
              },
              SUBMIT_CONTACT: {
                target: "submitting",
              },
            },
          },
          submitting: {
            invoke: {
              src: "updateContact",
              onDone: {
                target: "leave",
                actions: [
                  assign({
                    contact: (context, event) => event.data,
                  }),
                ],
              },
              onError: {
                target: "error",
                actions: [
                  assign({
                    error: (_, event) =>
                      "Une erreur est survenue lors de l'enregistrement de vos informations de contact.",
                  }),
                ],
              },
            },
          },
          leave: {
            type: "final",
          },
        },
        onDone: {
          target: projectHome,
        },
      },
      projectExperience: {
        initial: "idle",
        states: {
          idle: {
            on: {
              BACK: {
                target: "leave",
                actions: [
                  "navigatePrevious",
                  assign({
                    experiences: (context, event) => ({
                      rest: context.experiences.edited
                        ? [
                            ...context.experiences.rest,
                            context.experiences.edited,
                          ]
                        : context.experiences.rest,
                    }),
                  }),
                ],
              },
              SUBMIT_EXPERIENCE: {
                target: "submitting",
                actions: ["navigatePrevious"],
              },
            },
          },
          error: {
            on: {
              BACK: {
                target: "leave",
                actions: [
                  assign({
                    experiences: (context, event) => ({
                      rest: context.experiences.edited
                        ? [
                            ...context.experiences.rest,
                            context.experiences.edited,
                          ]
                        : context.experiences.rest,
                    }),
                  }),
                ],
              },
              SUBMIT_EXPERIENCE: {
                target: "submitting",
              },
            },
          },
          submitting: {
            invoke: {
              src: "saveExperience",
              onDone: {
                target: "leave",
                actions: [
                  assign({
                    experiences: (context, event) => {
                      return {
                        rest: [...context.experiences.rest, event.data],
                      };
                    },
                  }),
                ],
              },
              onError: {
                target: "error",
                actions: [
                  assign({
                    error: (_, event) =>
                      "Une erreur est survenue lors de l'enregistrement de votre exp??rience.",
                  }),
                ],
              },
            },
          },
          leave: {
            type: "final",
          },
        },
        onDone: {
          target: projectExperiences,
        },
      },
      projectExperiences: {
        on: {
          BACK: {
            target: "projectHome",
            actions: ["navigatePrevious"],
          },
          ADD_EXPERIENCE: {
            target: "projectExperience",
            actions: ["navigateNext"],
          },
          EDIT_EXPERIENCE: {
            target: "projectExperience",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "next",
              experiences: (context, event) => ({
                edited: context.experiences.rest[event.index],
                rest: context.experiences.rest.filter(
                  (_, i) => i !== event.index
                ),
              }),
            }),
          },
          SUBMIT_EXPERIENCES: {
            target: "projectHome",
            actions: ["navigatePrevious"],
          },
        },
      },
      projectHelp: {
        on: {
          BACK: {
            target: "projectHome",
            actions: ["navigatePrevious"],
          },
        },
      },
      projectGoals: {
        initial: "idle",
        states: {
          idle: {
            on: {
              BACK: {
                target: "leave",
                actions: ["navigatePrevious"],
              },
              SUBMIT_GOALS: {
                target: "submitting",
                actions: ["navigatePrevious"],
              },
            },
          },
          error: {
            on: {
              BACK: {
                target: "leave",
              },
              SUBMIT_GOALS: {
                target: "submitting",
              },
            },
          },
          submitting: {
            invoke: {
              src: "saveGoals",
              onDone: {
                target: "leave",
                actions: [
                  assign({
                    goals: (context, event) => {
                      return event.data;
                    },
                  }),
                ],
              },
              onError: {
                target: "error",
                actions: [
                  assign({
                    error: (_, event) =>
                      "Une erreur est survenue lors de l'enregistrement des objectifs.",
                  }),
                ],
              },
            },
          },
          leave: {
            type: "final",
          },
        },
        onDone: {
          target: "projectHome",
        },
      },
      projectHome: {
        initial: "idle",
        on: {
          BACK: [
            {
              cond: (context) => {
                return context.projectStatus === "draft";
              },
              target: "submissionHome.ready",
              actions: [
                "navigatePrevious",
                assign({
                  certification: (context, event) => context.certification,
                }),
              ],
            },
            {
              cond: (context) => {
                return context.projectStatus === "validated";
              },
              target: "projectHome",
              actions: [
                "navigatePrevious",
                assign({
                  certification: (context, event) => context.certification,
                  projectStatus: (context, event) => "draft",
                }),
              ],
            },
          ],
          EDIT_EXPERIENCES: {
            target: "projectExperiences",
            actions: ["navigateNext"],
          },
          EDIT_GOALS: {
            target: "projectGoals",
            actions: ["navigateNext"],
          },
          EDIT_CONTACT: {
            target: "projectContact",
            actions: ["navigateNext"],
          },
          CLOSE_SELECTED_CERTIFICATION: {
            target: "loadingCertifications",
            actions: ["navigatePrevious"],
          },
          OPEN_HELP: {
            target: "projectHelp",
            actions: ["navigateNext"],
          },
        },
        states: {
          idle: {
            on: {
              VALIDATE_PROJECT: {
                target: "idle",
                actions: assign({
                  projectStatus: (context, event) => "validated",
                  direction: (context, event) => "next",
                }),
              },
              SUBMIT_PROJECT: {
                target: "submitting",
                actions: assign({
                  direction: (context, event) => "next",
                }),
                // TODO: handle project submission to API
              },
            },
          },
          error: {},
          submitting: {
            invoke: {
              src: "submitCandidacy",
              onDone: {
                target: "leave",
                actions: assign({
                  projectStatus: (context, event) => "submitted",
                  direction: (context, event) => "next",
                }),
              },
              onError: {
                target: "error",
                actions: assign({
                  error: (_, event) =>
                    "Une erreur est survenue lors de la transmission de votre projet.",
                  direction: (context, event) => "previous",
                }),
              },
            },
          },
          leave: {
            type: "final",
          },
        },
        onDone: {
          target: projectSubmitted,
        },
      },
      projectSubmitted: {
        on: {
          BACK: {
            target: "submissionHome.ready",
            actions: ["navigatePrevious"],
          },
        },
      },
    },
  },
  {
    actions: {
      // Page actions
      navigateNext: assign((context, event) => ({
        direction: "next",
      })),
      navigatePrevious: assign((context, event) => ({
        direction: "previous",
      })),
    },
    services: {
      searchCertifications: (context, event) =>
        Promise.reject("Not implemented"),
      getCertification: (context, event) => Promise.reject("Not implemented"),
      saveCertification: (context, event) => Promise.reject("Not implemented"),
      updateCertification: (context, event) =>
        Promise.reject("Not implemented"),
      initializeApp: (context, event) => Promise.reject("Not implemented"),
      saveGoals: (context, event) => Promise.reject("Not implemented"),
      saveExperience: (context, event) => Promise.reject("Not implemented"),
      submitCandidacy: (context, event) => Promise.reject("Not implemented"),
    },
  }
);
