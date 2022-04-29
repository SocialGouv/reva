import { assign, createMachine } from "xstate";

import {
  Certification,
  Contact,
  Experience,
  Experiences,
  Goal,
} from "../interface";

const checkSavedCertification = "checkSavedCertification";
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
const submissionHome = "submissionHome";

export type State =
  | typeof checkSavedCertification
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
  | typeof submissionHome;

export interface MainContext {
  error: string;
  isProjectValidated?: boolean;
  certifications: Certification[];
  candidacyCreatedAt?: number;
  contact?: Contact;
  direction: "previous" | "next";
  showStatusBar: boolean;
  certification?: Certification;
  experiences: Experiences;
  goals: Goal[];
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
  | { type: "SUBMIT_CONTACT"; contact: Contact }
  | { type: "SUBMIT_EXPERIENCE"; experience: Experience }
  | { type: "SUBMIT_EXPERIENCES" }
  | { type: "SUBMIT_GOALS"; goals: Goal[] }
  | { type: "VALIDATE_PROJECT" }
  | { type: "SUBMIT_PROJECT" };

export type MainState =
  | {
      value: typeof searchResults | typeof loadingCertifications;
      context: MainContext & { certification: undefined };
    }
  | {
      value: typeof certificateSummary | typeof certificateDetails;
      context: MainContext & { certification: Certification };
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
        | typeof projectGoals
        | typeof projectContact
        | typeof projectExperience
        | typeof projectExperiences;

      context: MainContext & {
        isProjectValidated: boolean;
        certification: Certification;
        contact: Contact;
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
      isProjectValidated: false,
      certifications: [],
      showStatusBar: false,
      experiences: { rest: [] },
      goals: initialGoals,
    },
    initial: checkSavedCertification,
    states: {
      checkSavedCertification: {
        invoke: {
          src: "getLocalCandidacy",
          onDone: [
            {
              cond: (_, event) => {
                return event.data.isJust();
              },
              target: "submissionHome.ready",
              actions: assign({
                certification: (_, event) => {
                  return event.data.extract().certification;
                },
                candidacyCreatedAt: (_, event) => {
                  return event.data.extract().candidacyCreatedAt;
                },
              }),
            },
            {
              cond: (_, event) => {
                return event.data.isNothing();
              },
              target: loadingCertifications,
            },
          ],
          onError: {
            target: searchResultsError,
            actions: assign({
              error: (_, event) =>
                "Une erreur est survenue lors de la récupération de votre candidature.",
            }),
          },
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
            invoke: {
              src: "saveLocalCandidacy",
              onDone: {
                actions: assign({
                  candidacyCreatedAt: (_, event) =>
                    event.data.candidacyCreatedAt,
                }),
              },
              onError: {
                actions: assign({
                  error: (_, event) =>
                    "Une erreur est survenue lors de la sauvegarde de la certification.",
                }),
              },
            },
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
          EDIT_CONTACT: {
            target: "projectContact",
            actions: assign({
              certification: (context, event) => context.certification,
              direction: (context, event) => "next",
            }),
          },
          CLOSE_SELECTED_CERTIFICATION: {
            target: loadingCertifications,
            actions: assign({
              direction: (context, event) => "previous",
            }),
          },
          VALIDATE_PROJECT: {
            target: "projectHome",
            actions: assign({
              isProjectValidated: (context, event) => true,
              direction: (context, event) => "next",
            }),
          },
          SUBMIT_PROJECT: {
            target: "projectHome",
            // TODO: handle project submission to API
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
      saveLocalCandidacy: (context, event) => Promise.reject("Not implemented"),
      getLocalCandidacy: (context, event) => Promise.reject("Not implemented"),
    },
  }
);
