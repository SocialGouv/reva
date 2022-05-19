import { assign, createMachine } from "xstate";

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
  direction: "previous" | "next";
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
  | { type: "CANDIDATE"; certification: Certification }
  | { type: "EDIT_CONTACT" }
  | { type: "ADD_EXPERIENCE" }
  | { type: "EDIT_EXPERIENCES" }
  | { type: "EDIT_EXPERIENCE"; index: number }
  | { type: "EDIT_GOALS" }
  | { type: "CLOSE_SELECTED_CERTIFICATION" }
  | { type: "BACK" }
  | { type: "LOADED" }
  | { type: "OPEN_HELP" }
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
        candidacyId: undefined;
      };
    }
  | {
      value: typeof submissionHome;
      context: MainContext & {
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
        certification: Certification;
        contact: Contact;
        experiences: Experience[];
        goals: Goal[];
        projectStatus?: ProjectStatus;
      };
    };

export const mainMachine = createMachine<MainContext, MainEvent, MainState>(
  {
    id: "mainMachine",
    context: {
      error: "",
      direction: "next",
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
          onDone: {
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
            }),
          },
          onError: [
            {
              cond: (context, event) =>
                event.data.graphQLErrors[0]?.extensions.code ===
                "CANDIDACY_DOES_NOT_EXIST",
              target: loadingCertifications,
            },
            {
              cond: (context, event) => true,
              target: error,
              actions: assign({
                error: (_, event) => {
                  return "Une erreur est survenue lors de la récupération de la candidature.";
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
                "Une erreur est survenue lors de la récupération des certifications.",
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
            invoke: {
              src: "saveCertification",
              onDone: {
                target: "ready",
                actions: assign({
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
                  direction: (context, event) => "previous",
                }),
              },
            },

            // after: {
            //   2000: { target: "ready" },
            // },
          },
          retry: {
            on: {
              CANDIDATE: { target: "loading" },
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
      projectContact: {
        on: {
          BACK: {
            target: "projectHome",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
            }),
          },
          SUBMIT_CONTACT: {
            target: "projectHome",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
              contact: (context, event) => event.contact,
            }),
          },
        },
      },
      projectExperience: {
        on: {
          BACK: {
            target: "projectExperiences",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
              experiences: (context, event) => ({
                rest: context.experiences.edited
                  ? [...context.experiences.rest, context.experiences.edited]
                  : context.experiences.rest,
              }),
            }),
          },
          SUBMIT_EXPERIENCE: {
            target: "projectExperiences",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
              experiences: (context, event) => ({
                rest: [...context.experiences.rest, event.experience],
              }),
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
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
            }),
          },
        },
      },
      projectHelp: {
        on: {
          BACK: {
            target: "projectHome",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "previous",
            }),
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
                actions: assign({
                  direction: (context, event) => "previous",
                }),
              },
              SUBMIT_GOALS: {
                target: "submitting",
              },
            },
          },
          error: {
            on: {
              BACK: {
                target: "leave",
                actions: assign({
                  direction: (context, event) => "previous",
                }),
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
                actions: assign({
                  goals: (context, event) => {
                    return event.data;
                  },
                  direction: (context, event) => "previous",
                }),
              },
              onError: {
                target: "error",
                actions: assign({
                  error: (_, event) =>
                    "Une erreur est survenue lors de l'enregistrement des objectifs.",
                  direction: (context, event) => "previous",
                }),
              },
            },
            // actions: assign({
            //   certification: (context, event) => context.certification,
            //   direction: (context, event) => "previous",
            //   goals: (context, event) => event.goals,
            // }),
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
          EDIT_CONTACT: {
            target: "projectContact",
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
          OPEN_HELP: {
            target: "projectHelp",
            actions: assign({
              direction: (context, event) => "next",
            }),
          },
          VALIDATE_PROJECT: {
            target: "projectHome",
            actions: assign({
              projectStatus: (context, event) => "validated",
              direction: (context, event) => "next",
            }),
          },
          SUBMIT_PROJECT: {
            target: "projectSubmitted",
            actions: assign({
              projectStatus: (context, event) => "submitted",
              direction: (context, event) => "next",
            }),
            // TODO: handle project submission to API
          },
        },
      },
      projectSubmitted: {
        on: {
          BACK: {
            target: "submissionHome.ready",
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
      saveCertification: (context, event) => Promise.reject("Not implemented"),
      initializeApp: (context, event) => Promise.reject("Not implemented"),
      saveGoals: (context, event) => Promise.reject("Not implemented"),
    },
  }
);
