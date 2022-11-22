import { assign, createMachine, DoneInvokeEvent } from "xstate";
import { Direction } from "../components/organisms/Page";
import {
  candidacyStatus, Certification,
  Contact,
  Department,
  Experience,
  Experiences,
  Goal,
  Organism,
  OrganismForCandidacy,
  TrainingProgram
} from "../interface";


const candidacyDismissed = "candidacyDismissed";
const certificateDetails = "certificateDetails";
const certificateSummary = "certificateSummary";
const error = "error";
const loadingCertifications = "loadingCertifications";
const loginConfirmation = "loginConfirmation";
const loginHome = "loginHome";
const projectContact = "projectContact";
const projectContactConfirmation = "projectContactConfirmation";
const projectExperience = "projectExperience";
const projectExperiences = "projectExperiences";
const projectGoals = "projectGoals";
const projectHelp = "projectHelp";
const projectHome = "projectHome";
const projectOrganism = "projectOrganism";
const projectSubmitted = "projectSubmitted";
const searchResults = "searchResults";
const searchResultsError = "searchResultsError";
const submissionHome = "submissionHome";
const trainingProgramConfirmed = "trainingProgramConfirmed";
const trainingProgramSummary = "trainingProgramSummary";

export type State =
  | typeof candidacyDismissed
  | typeof certificateDetails
  | typeof certificateSummary
  | typeof loadingCertifications
  | typeof loginConfirmation
  | typeof loginHome
  | typeof projectContact
  | typeof projectExperience
  | typeof projectExperiences
  | typeof projectGoals
  | typeof projectHome
  | typeof projectOrganism
  | typeof projectSubmitted
  | typeof searchResults
  | typeof searchResultsError
  | typeof submissionHome
  | typeof trainingProgramConfirmed
  | typeof trainingProgramSummary;

export const INVALID_TOKEN_ERROR = "INVALID_TOKEN_ERROR";

export interface MainContext {
  error: string;
  candidacyId?: string;
  certifications: Certification[];
  candidacyCreatedAt?: Date;
  candidacyStatus: candidacyStatus;
  contact?: Contact;
  direction: Direction;
  showStatusBar: boolean;
  certification?: Certification;
  experiences: Experiences;
  goals: Goal[];
  organism?: Organism;
  departments: Department[];
  selectedDepartment?: Department;
  organisms: Organism[] | undefined;
  trainingProgram: TrainingProgram | undefined;
}

type selectedDepartment = { type: "SELECT_DEPARTMENT"; departmentCode: string };
type SelectCertification = {
  type: "SELECT_CERTIFICATION";
  certification: Certification;
};

export type MainEvent =
  | selectedDepartment
  | SelectCertification
  | { type: "SHOW_CERTIFICATION_DETAILS"; certification: Certification }
  | { type: "SHOW_PROJECT_HOME"; certification: Certification }
  | { type: "EDIT_CONTACT" }
  | { type: "ADD_EXPERIENCE" }
  | { type: "EDIT_EXPERIENCES" }
  | { type: "EDIT_EXPERIENCE"; index: number }
  | { type: "EDIT_GOALS" }
  | { type: "EDIT_ORGANISM" }
  | { type: "CLOSE_SELECTED_CERTIFICATION" }
  | { type: "BACK" }
  | { type: "LOADED" }
  | { type: "LOGIN" }
  | { type: "SUBMIT_LOGIN"; login: { email: string } }
  | { type: "OPEN_HELP" }
  | { type: "SUBMIT_CERTIFICATION"; certification: Certification }
  | { type: "SUBMIT_CONTACT"; contact: Contact }
  | { type: "UPDATE_CONTACT"; contact: Contact }
  | { type: "SUBMIT_EXPERIENCE"; experience: Experience }
  | { type: "SUBMIT_EXPERIENCES" }
  | { type: "SUBMIT_GOALS"; goals: Goal[] }
  | { type: "SUBMIT_ORGANISM"; organism: OrganismForCandidacy }
  | { type: "VALIDATE_PROJECT" }
  | { type: "SUBMIT_PROJECT" }
  | { type: "OPEN_TRAINING_PROGRAM_SUMMARY" }
  | { type: "SUBMIT_TRAINING_PROGRAM" };

export type MainState =
  | {
      value: typeof candidacyDismissed;
      context: MainContext;
    }
  | {
      value: typeof searchResults | typeof loadingCertifications;
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
      value: typeof trainingProgramSummary;
      context: MainContext & {
        candidacyCreatedAt: Date;
        certification: Certification;
        trainingProgram: TrainingProgram;
      };
    }
  | {
      value: typeof trainingProgramConfirmed;
      context: MainContext & {
        certification: Certification;
        organism: Organism;
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
        | typeof error
        | typeof loginConfirmation
        | typeof loginHome
        | typeof projectContact
        | typeof projectContactConfirmation
        | typeof projectExperience
        | typeof projectExperiences
        | typeof projectGoals
        | typeof projectHelp
        | typeof projectHome
        | typeof projectOrganism
        | typeof projectSubmitted;

      context: MainContext & {
        candidacyId: string;
        certification: Certification;
        contact: Contact;
        experiences: Experience[];
        goals: Goal[];
        organism: Organism;
        departments: Department[];
        selectedDepartment?: Department;
        organisms: Organism[];
      };
    };

const isLogin = window.location.pathname.endsWith("login");
const loginToken =
  isLogin && new URLSearchParams(window.location.search).get("token");
const navigateHome = () => window.history.pushState({}, "", "/app/");

export const mainMachine = (authenticated: boolean) =>
  createMachine<MainContext, MainEvent, MainState>(
    {
      context: {
        error: "",
        direction: "initial",
        certifications: [],
        candidacyStatus: "CANDIDATURE_VIDE",
        showStatusBar: false,
        experiences: { rest: [] },
        goals: [],
        organism: undefined,
        departments: [],
        selectedDepartment: undefined,
        organisms: undefined,
        trainingProgram: undefined,
      },
      // TODO remove this hack when url handler is done
      initial:
        loginToken || authenticated
          ? "projectHomeLoading"
          : isLogin
          ? "loginHome"
          : "projectContact",
      id: "mainMachine",
      states: {
        loginHome: {
          initial: "idle",
          states: {
            idle: {
              on: {
                BACK: {
                  actions: ["resetError", "navigatePrevious", "navigateHome"],
                  target: "#mainMachine.projectContact",
                },
                SUBMIT_LOGIN: {
                  actions: "navigatePrevious",
                  target: "submitting",
                },
              },
            },
            submitting: {
              invoke: {
                src: "askForLogin",
                onDone: [
                  {
                    target: "leave",
                  },
                ],
                onError: [
                  {
                    actions: assign({
                      error: (_, _event) =>
                        "Une erreur est survenue lors de la demande d'un lien d'authentification.",
                    }),
                    target: "idle",
                  },
                ],
              },
            },
            leave: {
              type: "final",
            },
          },
          onDone: [
            {
              actions: ["resetError", "navigateNext"],
              target: "loginConfirmation",
            },
          ],
        },
        loginConfirmation: {},
        loadingCertifications: {
          invoke: {
            src: "searchCertifications",
            id: "searching-department-certification",
            onDone: [
              {
                actions: assign({
                  certifications: (_, event) =>
                    event.data.data.getCertifications,
                }),
                target: "searchResults",
              },
            ],
            onError: [
              {
                actions: assign({
                  error: (_, _event) =>
                    "Une erreur est survenue lors de la récupération des certifications.",
                }),
                target: "searchResultsError",
              },
            ],
          },
        },
        searchResultsError: {
          on: {
            SELECT_DEPARTMENT: {
              actions: "selectingDepartment",
              target: "loadingCertifications",
            },
            BACK: {
              actions: "navigatePrevious",
              target: "#mainMachine.projectHome",
            },
          },
        },
        searchResults: {
          on: {
            SELECT_CERTIFICATION: {
              actions: assign({
                certification: (_context, event) => {
                  return event.certification;
                },
                error: (_context, _event) => "",
              }),
              target: "certificateSummary",
            },
            SELECT_DEPARTMENT: {
              actions: "selectingDepartment",
              target: "loadingCertifications",
            },
            BACK: {
              actions: "navigatePrevious",
              target: "#mainMachine.projectHome.ready",
            },
          },
        },
        certificateSummary: {
          invoke: {
            src: "getCertification",
            onDone: [
              {
                actions: assign({
                  certification: (_, event) => event.data.data.getCertification,
                }),
              },
            ],
            onError: [
              {
                actions: assign({
                  error: (_, _event) =>
                    "Une erreur est survenue lors de la récupération de la certification.",
                }),
              },
            ],
          },
          initial: "idle",
          states: {
            idle: {
              on: {
                SUBMIT_CERTIFICATION: [
                  {
                    actions: [
                      "navigateNext",
                      "submitCertification",
                      "resetOrganisms",
                    ],
                    target: "submittingChange",
                  },
                ],
              },
            },
            submittingChange: {
              invoke: {
                src: "updateCertification",
                onDone: [
                  {
                    target: "leave",
                  },
                ],
                onError: [
                  {
                    actions: assign({
                      error: (_, _event) =>
                        "Une erreur est survenue lors de la mise à jour de la certification.",
                    }),
                    target: "retry",
                  },
                ],
              },
            },
            retry: {
              on: {
                SUBMIT_CERTIFICATION: {
                  actions: [
                    "navigateNext",
                    "submitCertification",
                    "resetOrganisms",
                  ],
                  target: "leave",
                },
              },
            },
            leave: {
              type: "final",
            },
          },
          on: {
            SHOW_CERTIFICATION_DETAILS: {
              actions: "navigateNext",
              target: "certificateDetails",
            },
            CLOSE_SELECTED_CERTIFICATION: {
              actions: "navigateNext",
              target: "searchResults",
            },
          },
          onDone: [
            { actions: "navigatePrevious", target: "projectHome.ready" },
          ],
        },
        certificateDetails: {
          initial: "idle",
          states: {
            idle: {
              on: {
                SUBMIT_CERTIFICATION: [
                  {
                    actions: [
                      "navigatePrevious",
                      "submitCertification",
                      "resetOrganisms",
                    ],
                    target: "submittingChange",
                  },
                ],
              },
            },
            submittingChange: {
              invoke: {
                src: "updateCertification",
                onDone: [
                  {
                    target: "leave",
                  },
                ],
                onError: [
                  {
                    actions: assign({
                      error: (_, _event) =>
                        "Une erreur est survenue lors de la mise à jour de la certification.",
                    }),
                    target: "retry",
                  },
                ],
              },
            },
            retry: {
              on: {
                SUBMIT_CERTIFICATION: {
                  actions: [
                    "navigatePrevious",
                    "submitCertification",
                    "resetOrganisms",
                  ],
                  target: "leave",
                },
              },
            },
            leave: {
              type: "final",
            },
          },
          on: {
            BACK: {
              actions: "navigatePrevious",
              target: "certificateSummary",
            },
          },
          onDone: [
            {
              actions: "navigatePrevious",
              target: "projectHome.ready",
            },
          ],
        },
        submissionHome: {},
        trainingProgramSummary: {
          initial: "idle",
          states: {
            idle: {
              on: {
                SUBMIT_TRAINING_PROGRAM: {
                  target: "loading",
                },
                BACK: {
                  target: "#mainMachine.trainingProgramConfirmed",
                  actions: assign({
                    direction: (_context, _event) => "previous",
                  }),
                },
              },
            },
            loading: {
              invoke: {
                src: "confirmTrainingForm",
                onDone: [
                  {
                    actions: [
                      "navigatePrevious",
                      assign({
                        candidacyCreatedAt: (_, event) => {
                          return new Date(
                            event.data.data.candidacy_confirmTrainingForm.createdAt
                          );
                        },
                        candidacyStatus: (_context, _event) =>
                          "PARCOURS_CONFIRME",
                      }),
                    ],
                    target: "#mainMachine.trainingProgramConfirmed",
                  },
                ],
                onError: [
                  {
                    actions: assign({
                      error: (_, _event) =>
                        "Une erreur est survenue lors de la soumission du parcours.",
                    }),
                    target: "retry",
                  },
                ],
              },
            },
            retry: {
              on: {
                SUBMIT_TRAINING_PROGRAM: {
                  target: "loading",
                },
              },
            },
            leave: {
              type: "final",
            },
          },
        },
        trainingProgramConfirmed: {
          on: {
            OPEN_TRAINING_PROGRAM_SUMMARY: {
              target: "trainingProgramSummary",
              actions: assign({
                direction: (_context, _event) => "next",
              }),
            },
          },
        },
        candidacyDismissed: {
          states: {
            leave: {
              type: "final",
            },
          },
        },
        projectContact: {
          initial: "idle",
          states: {
            idle: {
              on: {
                BACK: {
                  actions: "navigatePrevious",
                  target: "leave",
                },
                SUBMIT_CONTACT: {
                  actions: "navigatePrevious",
                  target: "submitting",
                },
                UPDATE_CONTACT: {
                  actions: "navigatePrevious",
                  target: "updating",
                },
                LOGIN: {
                  actions: ["resetError", "navigateNext"],
                  target: "#mainMachine.loginHome",
                },
              },
            },
            submitting: {
              invoke: {
                src: "askForRegistration",
                onDone: [
                  {
                    actions: assign({
                      contact: (_context, event) => event.data,
                    }),
                    target: "leave",
                  },
                ],
                onError: [
                  {
                    actions: assign({
                      error: (_, _event) =>
                        "Une erreur est survenue lors de la demande de création d'un compte.",
                    }),
                    target: "idle",
                  },
                ],
              },
            },
            updating: {
              invoke: {
                src: "updateContact",
                onDone: [
                  {
                    actions: assign({
                      contact: (_context, event) => event.data,
                    }),
                    target: "leave",
                  },
                ],
                onError: [
                  {
                    actions: assign({
                      error: (_, _event) =>
                        "Une erreur est survenue lors de l'enregistrement de vos informations de contact.",
                    }),
                    target: "idle",
                  },
                ],
              },
            },
            leave: {
              type: "final",
            },
          },
          onDone: [
            {
              actions: ["resetError", "navigatePrevious"],
              target: "projectHome",
              cond: "hasCandidacy",
            },
            {
              actions: ["resetError", "navigateNext"],
              target: "projectContactConfirmation",
            },
          ],
        },
        projectContactConfirmation: {},
        projectExperience: {
          initial: "idle",
          states: {
            idle: {
              on: {
                BACK: {
                  actions: [
                    "navigatePrevious",
                    assign({
                      experiences: (context, _event) => ({
                        rest: context.experiences.edited
                          ? [
                              ...context.experiences.rest,
                              context.experiences.edited,
                            ]
                          : context.experiences.rest,
                      }),
                    }),
                  ],
                  target: "leave",
                },
                SUBMIT_EXPERIENCE: {
                  actions: "navigatePrevious",
                  target: "submitting",
                },
              },
            },
            error: {
              on: {
                BACK: {
                  actions: assign({
                    experiences: (context, _event) => ({
                      rest: context.experiences.edited
                        ? [
                            ...context.experiences.rest,
                            context.experiences.edited,
                          ]
                        : context.experiences.rest,
                    }),
                  }),
                  target: "leave",
                },
                SUBMIT_EXPERIENCE: {
                  target: "submitting",
                },
              },
            },
            submitting: {
              invoke: {
                src: "saveExperience",
                onDone: [
                  {
                    actions: assign({
                      experiences: (context, event) => {
                        return {
                          rest: [...context.experiences.rest, event.data],
                        };
                      },
                    }),
                    target: "leave",
                  },
                ],
                onError: [
                  {
                    actions: assign({
                      error: (_, _event) =>
                        "Une erreur est survenue lors de l'enregistrement de votre expérience.",
                    }),
                    target: "error",
                  },
                ],
              },
            },
            leave: {
              type: "final",
            },
          },
          onDone: {
            target: "projectExperiences",
          },
        },
        projectExperiences: {
          on: {
            BACK: {
              actions: "navigatePrevious",
              target: "projectHome",
            },
            ADD_EXPERIENCE: {
              actions: "navigateNext",
              target: "projectExperience",
            },
            EDIT_EXPERIENCE: {
              actions: assign({
                certification: (context, _event) => context.certification,
                direction: (_context, _event) => "next",
                experiences: (context, event) => ({
                  edited: context.experiences.rest[event.index],
                  rest: context.experiences.rest.filter(
                    (_, i) => i !== event.index
                  ),
                }),
              }),
              target: "projectExperience",
            },
            SUBMIT_EXPERIENCES: {
              actions: "navigatePrevious",
              target: "projectHome",
            },
          },
        },
        projectHelp: {
          on: {
            BACK: {
              actions: "navigatePrevious",
              target: "projectHome",
            },
          },
        },
        projectOrganism: {
          invoke: {
            src: "getOrganisms",
            onDone: [
              {
                actions: assign({
                  organisms: (_, event) =>
                    event.data.data.getOrganismsForCandidacy,
                }),
              },
            ],
            onError: [
              {
                actions: assign({
                  error: (_, event) => event.data.toString(),
                }),
              },
            ],
          },
          initial: "idle",
          states: {
            idle: {
              on: {
                BACK: {
                  actions: "navigatePrevious",
                  target: "leave",
                },
                SUBMIT_ORGANISM: {
                  actions: [
                    "navigatePrevious",
                    assign({
                      organism: (context, event) =>
                        context.organisms?.find(
                          (o) => o.id === event.organism?.selectedOrganismId
                        ),
                    }),
                  ],
                  target: "submitting",
                },
              },
            },
            error: {
              on: {
                BACK: {
                  target: "leave",
                },
                SUBMIT_ORGANISM: {
                  target: "submitting",
                },
              },
            },
            submitting: {
              invoke: {
                src: "setOrganismsForCandidacy",
                onDone: [
                  {
                    target: "leave",
                  },
                ],
                onError: [
                  {
                    actions: assign({
                      error: (_, event) => event.data,
                    }),
                    target: "error",
                  },
                ],
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
        projectGoals: {
          initial: "idle",
          states: {
            idle: {
              on: {
                BACK: {
                  actions: "navigatePrevious",
                  target: "leave",
                },
                SUBMIT_GOALS: {
                  actions: "navigatePrevious",
                  target: "submitting",
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
                onDone: [
                  {
                    actions: assign({
                      goals: (_context, event) => {
                        return event.data;
                      },
                    }),
                    target: "leave",
                  },
                ],
                onError: [
                  {
                    actions: assign({
                      error: (_, _event) =>
                        "Une erreur est survenue lors de l'enregistrement des objectifs.",
                    }),
                    target: "error",
                  },
                ],
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
        projectHomeLoading: {
          always: [{ actions: "navigateHome", target: "projectHome.loading" }],
        },
        projectHome: {
          initial: "ready",
          states: {
            loading: {
              invoke: {
                src: "initializeApp",
                data: { loginToken },
                onDone: [
                  {
                    actions: ["loadCandidacy"],
                    cond: "isCandidacyDismissed",
                    target: "#mainMachine.candidacyDismissed.leave",
                  },
                  {
                    actions: ["loadCandidacy"],
                    cond: "isTrainingProgramSubmitted",
                    target: "#mainMachine.trainingProgramSummary.idle",
                  },
                  {
                    actions: ["loadCandidacy"],
                    cond: "isTrainingProgramConfirmed",
                    target: "#mainMachine.trainingProgramConfirmed",
                  },
                  {
                    actions: ["loadCandidacy", "navigateNext"],
                    cond: "isProjectSubmitted",
                    target: "#mainMachine.submissionHome",
                  },
                  {
                    actions: ["loadCandidacy"],
                    target: "ready",
                  },
                ],
                onError: [
                  {
                    actions: assign({
                      error: (_, _event) => INVALID_TOKEN_ERROR,
                      direction: (_context, _event) => "next",
                    }),
                    target: "#mainMachine.projectContact.idle",
                    cond: "isTokenInvalid",
                  },
                  {
                    actions: assign({
                      error: (_, _event) => "Une erreur est survenue.",
                      direction: (_context, _event) => "next",
                    }),
                    target: "retry",
                  },
                ],
              },
            },
            fakeLoading: {
              after: {
                1000: { target: "ready" },
              },
            },
            retry: {
              on: {
                SUBMIT_CERTIFICATION: {
                  target: "loading",
                },
              },
            },
            ready: {
              on: {
                VALIDATE_PROJECT: {
                  actions: [
                    "navigateNext",
                    assign({
                      candidacyStatus: (_context, _event) =>
                        "CANDIDATURE_VALIDEE",
                    }),
                  ],
                  target: "ready",
                  internal: false,
                },
                SUBMIT_PROJECT: {
                  actions: assign({
                    direction: (_context, _event) => "next",
                  }),
                  target: "submitting",
                },
              },
            },
            error: {},
            submitting: {
              invoke: {
                src: "submitCandidacy",
                onDone: [
                  {
                    actions: assign({
                      candidacyStatus: (_context, _event) => "VALIDATION",
                      direction: (_context, _event) => "next",
                    }),
                    target: "leave",
                  },
                ],
                onError: [
                  {
                    actions: assign({
                      error: (_, _event) =>
                        "Une erreur est survenue lors de la transmission de votre projet.",
                      direction: (_context, _event) => "previous",
                    }),
                    target: "error",
                  },
                ],
              },
            },
            leave: {
              type: "final",
            },
          },
          on: {
            EDIT_EXPERIENCES: {
              actions: "navigateNext",
              target: "projectExperiences",
            },
            EDIT_GOALS: {
              actions: "navigateNext",
              target: "projectGoals",
            },
            EDIT_CONTACT: {
              actions: "navigateNext",
              target: "projectContact",
            },
            EDIT_ORGANISM: {
              actions: "navigateNext",
              target: "projectOrganism",
            },
            CLOSE_SELECTED_CERTIFICATION: [
              {
                actions: "navigateNext",
                target: "loadingCertifications",
                cond: "isDepartmentSelected",
              },
              {
                actions: "navigateNext",
                target: "searchResults",
              },
            ],
            OPEN_HELP: {
              actions: "navigateNext",
              target: "projectHelp",
            },
          },
          onDone: {
            target: "projectSubmitted",
          },
        },
        projectSubmitted: {
          on: {
            BACK: {
              actions: "navigateNext",
              target: "#mainMachine.submissionHome",
            },
          },
        },
        error: {},
      },
    },
    {
      actions: {
        loadCandidacy: assign((_, rawEvent) => {
          const event = rawEvent as DoneInvokeEvent<any>;
          return {
            candidacyId: event.data.candidacy.id,
            candidacyCreatedAt: new Date(event.data.candidacy.createdAt),
            candidacyStatus: event.data.candidacy.candidacyStatus,
            certification: event.data.candidacy.certification,
            experiences: {
              rest: event.data.candidacy.experiences,
            },
            goals: event.data.candidacy.goals,
            contact: {
              firstname: event.data.candidacy.firstname,
              lastname: event.data.candidacy.lastname,
              email: event.data.candidacy.email,
              phone: event.data.candidacy.phone,
            },
            organism: event.data.candidacy.organism,
            departments: event.data.departments,
            selectedDepartment: event.data.departments.find(
              (department: Department) =>
                department.id === event.data.candidacy.department?.id
            ),
            trainingProgram: event.data.candidacy.trainingProgram,
          };
        }),
        navigateHome,
        navigateNext: assign((_context, _event) => ({
          direction: "next",
        })),
        navigatePrevious: assign((_context, _event) => ({
          direction: "previous",
        })),
        resetError: assign((_context, _event) => ({
          error: undefined,
        })),
        resetOrganisms: assign((_context, _event) => ({
          organism: undefined,
          organisms: undefined,
        })),
        selectingDepartment: assign({
          selectedDepartment: (context, event) => {
            const typedEvent = event as selectedDepartment;
            return context.departments.find(
              (department: Department) =>
                department.code === typedEvent.departmentCode
            );
          },
          error: (_context, _event) => "",
        }),
        submitCertification: assign({
          certification: (_context, event) => {
            const typedEvent = event as SelectCertification;
            return typedEvent.certification;
          },
        }),
      },
      guards: {
        hasCandidacy: (context, _event) => {
          return !!context.candidacyId;
        },
        isDepartmentSelected: (context, _event) => {
          return !!context.selectedDepartment;
        },
        isTrainingProgramSubmitted: (_context, event) => {
          const typedEvent = event as DoneInvokeEvent<any>;
          const isSubmitted =
            typedEvent.data.candidacy?.candidacyStatus === "PARCOURS_ENVOYE";
          return !!isSubmitted;
        },
        isCandidacyDismissed: (_context, event) => {
          const typedEvent = event as DoneInvokeEvent<any>;
          // TODO: demander le candidacyStatus qui va bien
          // return typedEvent.data.candidacy?.candidacyStatus === "ARCHIVE";
          return true;
        },
        isTrainingProgramConfirmed: (_context, event) => {
          const typedEvent = event as DoneInvokeEvent<any>;
          const isConfirmed =
            typedEvent.data.candidacy?.candidacyStatus === "PARCOURS_CONFIRME";
          return !!isConfirmed;
        },
        isProjectSubmitted: (_context, event) => {
          const typedEvent = event as DoneInvokeEvent<any>;
          return [
            "CANDIDATURE_VALIDEE",
            "VALIDATION",
            "PRISE_EN_CHARGE",
          ].includes(typedEvent.data.candidacy?.candidacyStatus);
        },
        isTokenInvalid: (_context, event) => {
          const typedEvent = event as DoneInvokeEvent<any>;
          return (
            typedEvent.data.networkError?.result?.errors?.[0]?.extensions
              ?.code === "CANDIDATE_INVALID_TOKEN"
          );
        },
      },
    }
  );
