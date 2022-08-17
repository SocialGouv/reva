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
  | { type: "SELECT_REGION"; certification: Certification }
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

const isNewCandidacy = (context: MainContext, _event: MainEvent) => {
  return context.candidacyId === undefined;
};

export const mainMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFsCGBLAdgWVQYwAsswA6AGwHtUIsoBBABwbPT1QBd0LMARD1AMQRupLADcKAa1JosuQsXJUamekxZtO3Pu1QJxFTV0wBtAAwBdRKAYVY6LZmsgAHogCMANgAsAVhIATN7uvgAcYQDMoaGenhEANCAAnh6eAJyhJGahwQDsnrneue4BZp4AvuWJsjj4RJiklNS0jMysHMY6gmAATj0UPSTMHABmA8gkNfL1jcot6u2OXfqYEkbc5lZIILb2js5uCEHu7iRpse4R3mnuZgFXiSkIIblmJLlBZaFp954BvpVqhhagoGkpmqoAMK9TgjRbGWBCEQkAzSSbA6aKJoqKDQnqw+HcWArNYdDaWZy7BzGA4eCJmCIkXw+AKsiIRXznG6PDwBE4kS5lXxmc5mBm+byAkBTOpYuZQmHoOHrTCI3r9QbDdhjHoTGWg2YQ3GK5Vk1UkwxmzaUuzU7i055hN6hYr3EXBe7eAI855RTzvXK5CK3AJpKLfKX6mYkWBgVA9QgAJTgAFcyOxEQBlACiABls5CACoAfUh2cThYAkgAxSuQuhVgDyADkbXsadtDl4YiRQqHg54Jczvp4fbdiiRvNFfEHSu5vFPJVVpRjZWDY-Gk6n01m8wWS4nswBxSsttt2pyd1KhU7uUJXNJpXI-CIfXw+mIBEhRLkhn65aJI1XA0SDwE1FjATMU2QNAeiSFEIDIMABEzABVAAhbBKxLMsKxrOsG1PVttipfYryOG40neEJ70DQdfAiNIxyCbwSE8Epskogo4gCIC5DXUgwPxJUIKgmD43g2AUwAI2QBxOChAhUFUZDhDBVEZGA6MhIJTRIOg2DJJkuT2AU3ElJUi0VWtEjbTI0BDnZYIBQiAJYjnTxOO8MczHyScZwiHjXldXI+JBbTwL0sTDJjYz5NoSELJgAR1QGIYyFGcZ0X4kCdJEqKDIk2LZPixTlJgKyrQpWz23tcjXOcn5PPcDJg1yCUP0HQIwwXL1fEudqlyBHKIuE012H08S4JIHowHYOCUIwrCcPLKta3rJtiJsOyOwcxBXxa3sAmfa5ohCBkP3+b9BsHEI4jMLwwsxME8vGybDKRdddAm7LwsUV7RMKuDz3s1xEH+YNAnpCGCn+B6xxdN5ii8QKn1eW4KmXKN-sijh3okz7RFWKRNJGnGxsBqakkqxwbO22rLz2hBvAer9jpdTxwjFG5Yh9H4qPOW5GMDG8iiGlcyZe3GJuignUs1DLtSy7GpYpgqqZp4w6Z2Ha6qZlnLiZdjWQY-I-gKMdblYrwvF6jJvjMcWVcE6X8YWzMAAlGwAdVLVb8I2ojix4bNCzoStc0zEHdrBhBw39Lw0mZWIk8C0dkg8Tl-HZfJfH+K36TSJ6BNA13ZYWyFc0bHNixzfMi2zHg-bw9bCLPGqLwdIIoih+5ilibIOozhBzi-JOWridIWolYvctdng5owMhYAQpDFsw7Dm7WgjNujvXY9fFn-PuJPQyfApvOH+k73eAdRQCG8AN4rGtPJ3S8YX3R0GX4qTLMxLyqqWRBpX6z0XZqw-ovb+K8pIlVMglJKYBNbki2PTTu9VhZnDcofBiXhebDwfo+QIfwww3DKCcIuL9JbgPfhNT+S8YFxXgWVFSKU+hpS1DqPUr9Va0LAPQ6Bv9SrmUAcg0w1U0Gg0cpgpqOCBz4KeG5MMvZhSlE8i6V87VZ6jT4QIn+s15pJHXstLeAc25bR1gzB0jFXICleGkKcZhfD9XZD6NyC5JyvhFGKbIrxAJUL+rw-KkCv7L0JjGb6pNAk0OCXQqBy896M1jg-ZkvZ3AATCHnO8D83H-mIZyPwJwriuVCgEsBpcIFxNCYidCdBIQAGlEnWPSP4K2gYgwFGfO+AhC5TjeHYsGaeoRHbaMULAuSsB7DcA9hQZAhocThJAc7IRkzjAzLmeCHEYjtakRjl2aIVEHrDIcZPJx6S3GBjHgxfpJQPj9PvKM9ccVVnTNmfM2gbCNTpUyrqUBJdxnoBeZgdZ7zVDbIkZY9BTM7zfCyHed0pz+q5FyWUd4T4Wo3mDGkBkoRHmkABUCkFM05ruyWpvXC29A7t0kXsjwBy4XHP6YFM5yKCHhEyOEc4OQH4i2cXilZUzgVvOJdQIxtSGlNPImyXI-lnGeQlIGa4FyupOPyNDE4nNcVlP+c8wVRLZqipQl7X2AAFRMjYABS+5ixe2wNmSVTNpWyuZE4oohQmIEIKFREI85fIT1fPygleq3nhNgJEv5IEg1rLeQ6g+6T-AznOHROIrxvQEOwd+V8QQuUhAfpjYa0Shj9AAFZgDwOwSE3BdDltXshcVjSO5SMQAAWk5pONG3hXK-HaqEH0rkbhZAcVcG8DigwhH5QwEtZaK1VvwOwWtxjyUtjDkWWNhxW2ZGuIqrtgUe19pKP6C4nb7H5DKBECdU7y2VswNW+d8sBD1rXYgdIjJnw2JvC1NyfZ90+EnD4S4M5hkMncBeigpar2zprfetCG8cLLrqYWJ9zNUWsmiP09iORmSXyeMGR27wGQfAfl6JOAJtUgUnWB6d17b1COYVARZxM0TLIo+BmdN6520bMuC1BkKm1xxvEbIMwz7ilHvH4PtRy0XuoyMdSe56yPRhY1RyD86AV0c+RwxWXCI2KcvWxmjamuMGGshC3Z+9HICeZEJu4rlshXG6Th3NbEPRp0Rh8eTBbylKYg+x8tobw3Mb09RudSHAxURHfcW2jsggOfBj2wISjQwMmFqB1j2YXAMF6OgMAmAwILsfY22lzwQhUXZI+Eo9xcHYcQCzRkORvhFCFOfUjnmS7efYOlzLPRsu5dEIhZCMGTHZgABomvLJWbMzYyxIZOJyTN5W2RVbcQxM42Q+5yfyKU1r5G9OdayzlvL96Cs0vMx4cevYxQc0Cv8cTBCPjvDcmEdJ7I5zslS9Ovb3WDukGg2SksI2xuJgm1N+1hXTvPB8IyEo3xz6FGZK5NxkMk5OPuFEdJQR-Hbd05R8tn2et5cMx8tSRMJBMZ4aQdrePvucdoNxmbcR-CO3pK8biwzLhjiuIEIMjWTYSmfljxQlOMv7d6zT1QGmFY-O4dQotOOOvC6+6LwnYLjNVR42ZpJXYGdZE7b5Mo+Q2cJDu+F6IBGTbcq2xLQtQuuv46AV9PGOnBe7YV3bmbnaqLOLFn8fqLpv3D08m8Lttx0lihNiBhTzu5dU96zUupDaTua+fX2bqwfiO7tiyPPkf6kVXA6Tcd7uPXffcRHQHgTcAfjcm9NsHSfnjJdvpFsUQZHZhh9JzRkXoxQPjzqGdihf5e25LwIRum9K9A+r6DxPDoTidqyNkdIfxghigUYgJ7mbFXI36UES3gXo-F9j4u-7o2q8g6jrXmf0XnM+Bb2+VkfM7jXWyOklkFWtUC7BO1j2YAyAMAffHpDIIf0J+dyeHYUbvNxNyf0PNO8WIGIO5XfcnWXVjI8KgH+dAfrf-CVC-ciTIdzFqKIdkADPkI3J4W4RnPsZqbFZGB6AfVA1AdAzAwbTeI8RsOgSOJDPAyLMMe8YMDkEgn0ZtObDkBkEUFqMUH1CPD-CnPTegn+I7AAnApmTmb1POcIBiekO4TtQQ7PBVdiJxXyTkI5OgtAleX7WDYsVg9g8-afciL0L8DJFpT4IIbuQQgTekYTK4BcWIWIFrK3LzWQ0wsXejYnFERjKJAIuXOQxhOBIzYmEzdXXWOvYIU4XvXw58PkfQ6rBAZtLwGVPkL0fpPwR8erfnfwtrQIhgmIv+D5eWb5JWX5PfFAoI5XKAOnJQ2OFIpkVkdIn4G2R2QQ9kJ-YUUUV1bFKQ8onbKI0w-zR3Jo6daI93ViL0b4PkfqQcQoEINxOIb8OIErHfYWShaQ5A6dIlDAteAANXYMrB4AbGzGLDNUtX3CQ36SyB4jCED2xUfA9TIOGU7wcSZ2vmHAHzOKYL+wePNStVXQ6MOHuEyE5iZzcnsRvGyARmGTOGDCyR5R9Q80mOx1YyJVaIY1JwiIqLl0JKYTiNJFplMySIdE5n9BHE5H-WOkDEzzvH5H6jvD4ODDdTKPmPLQpNiNqPYUlwaOl2tz0yFJqJV3iLVyQwZN7HOGZI9HaXZO+BlWCGGQlCuC9QYhBJDVCLDTmKQK-xjRhMQH5m-AoU5B+AfgAzcTPWc2CHYkA2TnzTxKjwJJDWO14yK3DGuhRlfD7ECgRx6XajOGZC-XnGGWuFxIFPYBBRHx4DHxPwnzP1CwyCZAXEKEa2SxdDHBnCRk+BUN+H+ANLmWTJYLYI4ItKOECjOGKM5GOnsOuHZKHAxPSXajzmcX6j8ITKTNHzg2bBXUQzrMHEyBkzh1fHYgyUdJW18JKUYjkydlNKlJDUrmrnuLrn3EblMVbl3jrJOHRPs2Axi3UN7WHnRz6TahnAYjCByA9IHJDUbDG2bBtTzBNSQzCCZEfFZG5kTUTjcVuG9SfAlH-XCCiFXJl3aygliMgCwITz9PB1KB+G-GcR+D7FKGI3Thw2DN-LQ07Qan7ylEwAoAgDgGcGWWxHmDaBVC6EALwV7AAhxRkxFFIMzjziVJhVfHtkCn7KQJooVEqQRBmwfkZAcT7DDHoinG5CvI5E9wXAyF728IeUjzBHlkAJZAFByGChFHvHvyvMiDYkwo5P6mUqfKQI3ATAIGTCkh3GzFFJmz7EnPnDhJdGUvag5yIUKHlVPlZGuCOM9PXDjBsrsrTAzBm0IyZEYkdhAqIIyD5iDB1xcXOB8GxUsplwBnVhinOLAEAIAhlRdHuQXxiFfEtjbX0ufGai8UuH5WyrxnLiMmFJYRgCQ3pEhhyBOEKr5BanOSvKcTq28UVRRgAnf2CpiTeiauJUMXauFBlTRjzmKBsS9A4oQD92IT5HHnziIvqrLiBngiQlQDEHyrrP4tYhsVZDDA5GFFcQGpdAFDDEKGKDKHoj2sqTdieFsMdTVWYpKpiDKtZSeFTX8j+AZHzliEDHet0XiRXjyrmvu2fBFFDEuAPUvJwwelOEixesuH7XHXUsmogj0WqOEQARUnao4mc0uXah-D7EzyUUyHZBszuB6h+GhtiX4VhpmuBjOp8DeCfAal5NDH6QuV8mtO+C5PSROH5KQIaqqQYXIDjBOvataknF6pnK5Xpu+EZBizRkGQ8MQKyvnlhvapFEPT5Jpu+DpuW3u3uX7RvEgqcUDV1WjQ2SEqgBm3MsCBiB+E7S9FzguSfDYkGhyBFGxSnGdpKkJWFQMR5u+uSTnCwS3XWL9XyFyVDECHSRZg2LFiCuWSjVeQ2QNQgC+uQrrz5FKAFFKFw0xWvjWq-WgMcQ0IuHSUjomWDTdqVtOvjthO30CCKGrsYmRyDGVUOVDE-HHF9UysLQLqFTmXdyTm9vSG7n9sHG2LFuyRvxX0-QH2CxrXhrrObU+EnHc2iAfkdleBnD7V6tvjDGlqfGCHOF3pUxIE0rrIKWtKKE5SXy-v3R-Mkrzj+GOEHGnsiNYz3tU0pNoBm0OgfIng4kxMYn3XnDYglAcQcWwTewJpOJ8xoyOuVrrLGt7HCG6urr1x+P2hoknAHv7X5g5GgslLlwgaQyPt-RobPtjMvqBvBhOSOg0XOBwXGoTJjzywPp7o8DFFYgw2ZD6q5JvD7SPlWtFAyCer+ENsYbSwP0OycqPPCC-FcnRy7xnCALcR7Gnlcm4n7FAbJM0aHyVygdUBm0CkyAYmwQ5hvyHkUUagemk1unFGsamNsZFzy3we7rLq7icX9CUo8PFA0LTUUXCBMuFj8BPhuAmOEa0bCY1wdAyDeGkfYhuDkfcHb30Yvvtg0RvwHxEcoqPLKCRiOQNw5F9XicQFFhMsXBnCIvBpBJ-wYG-JceAYKF8mfBiGyNZAnG3w+FzlKFZBMKqNrRYZODeEGsHGwuPWiFMbYmAydFuBFAfJlpgsqPkJ0fEYQDCCogKC8TalsweGHiPplTPX-LPT8AwrmZ-laOcutkYi5hZuKH6kEInA5C9QZOhxHTeZXlCdCxyH7tq16SiEex0JlSwxcWFpBdmewfa0WMPsuFYhWbzkdnWfRpbRPh0s0N8Ieh4gYbAdOOFTEfCfIjQp4iUWcRpvmoRgcUnDD1iAHGiACfxJpY2TftOZ5mtK+DvJkaQavLIWIa9VUf1IxfXI2Q+brNWsCHmvvBeBag6QRjbR+FusChogAipZsYFcaC7qQxFdw05nFYGQoeeD7GWIyI1bPhvAEsOfJPNNOdZDeNcg+O5jDrtee1SP+HEpOEuBHAHzgr-kgEAM4kzWFCnmrocQUYjJnE8gOnjWKTxRYYfk3VPpcovtVUGP5B9Rps6TWyCEqEqCAA */
  createMachine<MainContext, MainEvent, MainState>(
    {
      context: {
        error: "",
        direction: "initial",
        certifications: [],
        showStatusBar: false,
        experiences: { rest: [] },
        goals: [],
        projectStatus: "draft",
      },
      initial: "loadingApplicationData",
      id: "mainMachine",
      states: {
        loadingApplicationData: {
          invoke: {
            src: "initializeApp",
            onDone: [
              {
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
                cond: (_context, event) => {
                  return event.data.candidacy;
                },
                target: "#mainMachine.submissionHome.ready",
              },
              {
                actions: assign({
                  goals: (_, event) => event.data.referentials.goals,
                }),
                cond: (_context, event) =>
                  event.data.graphQLErrors[0]?.extensions.code ===
                  "CANDIDACY_DOES_NOT_EXIST",
                target: "loadingCertifications",
              },
            ],
            onError: [
              {
                actions: assign({
                  error: (_, _event) => {
                    return "Une erreur est survenue lors de la récupération de la candidature.";
                  },
                }),
                target: "error",
              },
            ],
          },
        },
        loadingCertifications: {
          invoke: {
            src: "searchCertifications",
            onDone: [
              {
                actions: assign({
                  certifications: (_, event) =>
                    event.data.data.searchCertificationsAndProfessions
                      .certifications,
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
        error: {},
        searchResultsError: {},
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
            SELECT_REGION: {},
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
                      assign((_context, event) => ({
                        certification: event.certification,
                      })),
                    ],
                    cond: isNewCandidacy,
                    target: "leave",
                  },
                  {
                    actions: [
                      "navigateNext",
                      assign((_context, event) => ({
                        certification: event.certification,
                      })),
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
                    assign((_context, event) => ({
                      certification: event.certification,
                    })),
                  ],
                  cond: isNewCandidacy,
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
            {
              cond: (context, _event) => context.candidacyId === undefined,
              target: "submissionHome",
            },
            {
              target: "projectHome",
            },
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
                      "navigateNext",
                      assign((_context, event) => ({
                        certification: event.certification,
                      })),
                    ],
                    cond: isNewCandidacy,
                    target: "leave",
                  },
                  {
                    actions: [
                      "navigateNext",
                      assign((_context, event) => ({
                        certification: event.certification,
                      })),
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
                    assign((_context, event) => ({
                      certification: event.certification,
                    })),
                  ],
                  cond: isNewCandidacy,
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
              cond: (context, _event) => context.candidacyId === undefined,
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
                onDone: [
                  {
                    actions: assign({
                      candidacyId: (_, event) =>
                        event.data.data.candidacy_createCandidacy.id,
                      candidacyCreatedAt: (_, event) =>
                        new Date(
                          event.data.data.candidacy_createCandidacy.createdAt
                        ),
                    }),
                    target: "ready",
                  },
                ],
                onError: [
                  {
                    actions: assign({
                      error: (_, _event) =>
                        "Une erreur est survenue lors de l'enregistrement de la certification.",
                      direction: (_context, _event) => "next",
                    }),
                    target: "retry",
                  },
                ],
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
                BACK: {
                  actions: "navigatePrevious",
                  target: "leave",
                },
                SHOW_PROJECT_HOME: {
                  actions: "navigateNext",
                  target: "leave",
                },
              },
            },
            leave: {
              type: "final",
            },
          },
          onDone: [
            {
              cond: (context, _event) => {
                return context.direction === "previous";
              },
              target: "certificateSummary",
            },
            {
              cond: (context, _event) => {
                return context.direction === "next";
              },
              target: "projectHome",
            },
          ],
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
        projectHome: {
          initial: "idle",
          states: {
            idle: {
              on: {
                VALIDATE_PROJECT: {
                  actions: assign({
                    projectStatus: (_context, _event) => "validated",
                    direction: (_context, _event) => "next",
                  }),
                  target: "idle",
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
                      projectStatus: (_context, _event) => "submitted",
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
            BACK: [
              {
                actions: [
                  "navigatePrevious",
                  assign({
                    certification: (context, _event) => context.certification,
                  }),
                ],
                cond: (context) => {
                  return context.projectStatus === "draft";
                },
                target: "#mainMachine.submissionHome.ready",
              },
              {
                actions: [
                  "navigatePrevious",
                  assign({
                    certification: (context, _event) => context.certification,
                    projectStatus: (_context, _event) => "draft",
                  }),
                ],
                cond: (context) => {
                  return context.projectStatus === "validated";
                },
                target: "projectHome",
                internal: false,
              },
            ],
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
            CLOSE_SELECTED_CERTIFICATION: {
              actions: "navigatePrevious",
              target: "loadingCertifications",
            },
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
              actions: "navigatePrevious",
              target: "#mainMachine.submissionHome.ready",
            },
          },
        },
      },
    },
    {
      actions: {
        // Page actions
        navigateNext: assign((_context, _event) => ({
          direction: "next",
        })),
        navigatePrevious: assign((_context, _event) => ({
          direction: "previous",
        })),
      },
      services: {
        searchCertifications: (_context, _event) =>
          Promise.reject("Not implemented"),
        getCertification: (_context, _event) =>
          Promise.reject("Not implemented"),
        saveCertification: (_context, _event) =>
          Promise.reject("Not implemented"),
        updateCertification: (_context, _event) =>
          Promise.reject("Not implemented"),
        initializeApp: (_context, _event) => Promise.reject("Not implemented"),
        saveGoals: (_context, _event) => Promise.reject("Not implemented"),
        saveExperience: (_context, _event) => Promise.reject("Not implemented"),
        submitCandidacy: (_context, _event) =>
          Promise.reject("Not implemented"),
      },
    }
  );
