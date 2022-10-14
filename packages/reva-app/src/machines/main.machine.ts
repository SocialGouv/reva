import { DoneInvokeEvent, assign, createMachine } from "xstate";

import { Direction } from "../components/organisms/Page";
import {
  Certification,
  Contact,
  Experience,
  Experiences,
  Goal,
  Organism,
  OrganismForCandidacy,
  Region,
  TrainingProgram,
  candidacyStatus,
} from "../interface";

const loadingCertifications = "loadingCertifications";
const searchResults = "searchResults";
const searchResultsError = "searchResultsError";
const certificateSummary = "certificateSummary";
const certificateDetails = "certificateDetails";
const loginHome = "loginHome";
const loginConfirmation = "loginConfirmation";
const projectHome = "projectHome";
const projectContact = "projectContact";
const projectContactConfirmation = "projectContactConfirmation";
const projectExperience = "projectExperience";
const projectExperiences = "projectExperiences";
const projectGoals = "projectGoals";
const projectOrganism = "projectOrganism";
const projectHelp = "projectHelp";
const projectSubmitted = "projectSubmitted";
const submissionHome = "submissionHome";
const trainingProgramSummary = "trainingProgramSummary";
const trainingProgramConfirmed = "trainingProgramConfirmed";
const error = "error";

export type State =
  | typeof loadingCertifications
  | typeof searchResults
  | typeof searchResultsError
  | typeof certificateSummary
  | typeof certificateDetails
  | typeof loginHome
  | typeof loginConfirmation
  | typeof projectHome
  | typeof projectContact
  | typeof projectExperience
  | typeof projectExperiences
  | typeof projectGoals
  | typeof projectOrganism
  | typeof projectSubmitted
  | typeof submissionHome
  | typeof trainingProgramSummary
  | typeof trainingProgramConfirmed;

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
  regions: Region[];
  selectedRegion?: Region;
  organisms: Organism[] | undefined;
  trainingProgram: TrainingProgram | undefined;
}

type SelectRegion = { type: "SELECT_REGION"; regionCode: string };
type SelectCertification = {
  type: "SELECT_CERTIFICATION";
  certification: Certification;
};

export type MainEvent =
  | SelectRegion
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
        | typeof loginHome
        | typeof loginConfirmation
        | typeof projectHome
        | typeof projectSubmitted
        | typeof projectGoals
        | typeof projectContact
        | typeof projectContactConfirmation
        | typeof projectExperience
        | typeof projectExperiences
        | typeof projectHelp
        | typeof projectOrganism
        | typeof error;

      context: MainContext & {
        candidacyId: string;
        certification: Certification;
        contact: Contact;
        experiences: Experience[];
        goals: Goal[];
        organism: Organism;
        regions: Region[];
        selectedRegion?: Region;
        organisms: Organism[];
      };
    };

export const mainMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QFsCGBLAdgWVQYwAsswA6AGwHtUIsoBBABwbPT1QBd0LMARD1AMQRupLADcKAa1JosuQsXJUamekxZtO3Pu1QJxFTV0wBtAAwBdRKAYVY6LZmsgAHogBMARgDsAThIALAAcQQBsQb6hAe4ArN7eAQA0IACeiD6e7iSxvjEBAMzeMfn5nkHuAL4VybI4+ESYpJTUtIzMrBzGOoJgAE69FL0kzBwAZoPIJLXyDU3Kreodjt36mBJG3OZWSCC29o7ObgjuAZ6eJJGhnvkBvp5m7jfJaQiecWYk3idm4b6PobEqjUMHUFI0SKhFhtePwADLKSACADKAFFYSiAMIAFQA+gAlFEAcQAkgB5AByzj2DmMh3SMXcQU+viCN1C3giXxiz3S3nyoQu+RiQRivmCAWiVyBIGm9UUzRUUAxfU4oyWxlgQhEJAM0hIsDAqF6YKgAFpemAoMZTXgVeg1dCqXYadw6a8ikzfGZvGUovEigFvDz3YEAey-mZfHdvGZrtLZWC5i1VMreqr1dxNX0BkMRuxxr1JgajSbzZbrba0-aM04dtSDjsjj5hRdvb7A-E8kHUohTfkPsU+e5vV6zOUWd54yCZopK+nobB4dREaj0dicRiUXiscSAGLEjF0HcUp37WmNjznEX9oKeUJex6xOLBm5jkjXBl+CKhfLRqdyOVwTnasFyXCAVzRTFcQJEkTzrZ0G1AI4vBIa8xzvB98ifbsXjZGJPh+EVMgCKIIgCf9QVmfVDWNAg8TgABXMh2E1VcoI3Lcd33Q9j0peCz1dC9XnCAVx1KUI8hiX5QmDe4fUCEI4iw2MJSCcjqhladANIYCHQ4MAkQY5A0F6FIdQgMgwGRABVAAhbBiVxTdtz3A8jzJPibAQ88kI8O5-B9YVCm8CTil8WSTgCEgrmHCJPEiEKsIomcgLtPT2AMoyTLM2AGIAI2QBxOBTAhUFUKzhHBXUZC0xMSF0pZMuMo0cvywr2GKpVSvK1Z1k6TZLFPF1a18hASlOd8sNCAFY1CMcxVk70BQCJSf3cGMfXW5LtPqtLGsM5rTP1NqitoDFupgARs0GYYyDGCYplqqiGs0JrsuOgrTpKsqYF6wx+tMQb+OGt0sImv45vi1lmySHsEDCfD3F8G4JVia4A22uqXv0g73otdhTJs+zHI4lzuPcuCvIEkbXEQQp4tQ9axRZW8YjMfJg3KfDCjyCS3h-WbMeevbXtxlqtXBWBdAyx6AKxkWcaylqhsQ2njmKc5HgeYp2ViWNZKCGNPjOH973iWMfiF2cFYysXCcq0Q1ikGq5eFqt0relq-uhLYVZ8tWAljLJ1sN8I2cjO8ZLhv5-Eie5f3iW9A3U4FXet939qVwnrtzO78wehM3fnRXDpSb2Ad94HVaOQPrhIKTMliQppvcdlZPuKK7zvCVbhCL0U80tPUoz0Ws5SZEAAlSQAdVJri3N4nEeBRLE6GJWEkT9wTRvyEIBQwqTptyfko5eN5chIEoQoZGIO-7XwreH4vbbHgQMVhUlURxNjsRRHg59cjxDyW8abIQKEyR89NppjjyMGSIWRcjxVNv5PIj8dI2zADwMAuh0BkFgOZSyRMHJOU4oAimnldjeW3mrQogdAgMl-AyKMIUEgvljEyPkGE5qMh8OUNBu0R76SwTgvBH12qdXOj9Cq2pqqy0ounZ+mDsEYFEblT6HUzoXTAOXRwlcqYgyEiUXw3gLit1oRraap8PARH8K3JGv57hXHivw7GGVhEqPwWo8RmipFXX6DdPMBZJiFwUSBIRyjcGeJOho76PUDA+yBvo6udME6mJ-AkCx01gyt2RqhNmw45qG2CjEFxGD3GRJIPjQmSI7LEIAeTXiIDQbIyyD4SMwQzAxFviUbJUQooFBjKOMcMYQilMEW4iJeCJakClvpORKV0HjKUSI+AVd-bIRFKJXhwoGRlEZNkv4JjW6ihWmcG4WFJwaRCU-MJEyVkCFsnQDEABpJphj7z4Q7v6fk8RcjZIlOcEi1wzi5CCGYAe1yZknVgPYbgE8KDICTIqaZOonZ6khWI9AMLjDwsRUoZMUAdHGD0ZQ6mboygRBIOw9pptOk+GyfEBBxQgXrROOEfI-CvFYthZgXFSLaB+JzLde6hZ5k7S5diuFCL+WqCJQNbYST1npD7lSsoNL+R0pwn5H4zIfQsmBV6XenLoU8r5ZU7B1Takk2cvPIBlNSUGNGhS-w1KxS0tvlq44IomQikiGpRkicunGs+pK3l0rzXUHHo8l5bzRruEeCYlaXS5pdgSOFOG60JJUriALLwd5RlXKeooCVprw0WkjZPGeOIAAKeJSQACl2JT2wCiWNat42FHocmzpHZbi9L8O+W+gc9XpODYVUNfKUWzJlhiktOLpVtqOKUIo9c-DshCukh42SzGX0KCcP1bxGShH4QwAYAArMAeB2AYm4LoK9BCrLRteWs6hRxTThECMYhIWF-gehfEjc47Sbi3jFJwkphah6kFPRQC9V6b2YDvewB9RDrUUlXtiRdvYP23HiAUDt7JhQvkyAKaangBmRhCj8DlEH5Hgmg7B69t78BIZzg8p5z7FWvsQPefIzJfy7xBa3coRGoihlOEKDkZh2aeBPeey9jGEPMZIKxmpxMnJoaeViTDCBA4CnjSEEiVw1JSVhrhDuBE92MmiLkcDqdaNQbk3Bpj96uUxKgCi2RGL6Pyfg4hzFbm5WAwVQ65JY1bz13ZLvB4ylWQrTYWUXVtwWSZv5NRuzCzhiOYU351znVBUBLzkEsVdVvNOcUy56JnVAskvrEqsL5wpJ8jBY+McNxuRw1KAyaKpx-jhA2o8WTMGfPOfYFO6WLt7OZaG2VxD2nfmoXio8bu4KTjtZeOtFs8b7xI3ZgnQbDGUQuAYH0dAYBMC2mQ0+7TZxRS7qjI3IUpRTOIEDrxtSZEYwSWMRJfb8nDvHd6Kd87ogLJWVU3UlEAANatW5iQonJJua7587t3A7RrZ76teNenKM3VLLDftXv+yds7F3WNXZfaA9IiDUJSdDvyWIcWM1fE+Mc28fJlLXDS4PSbpX2BE8ByT0gKmrW4ihzDvEcOEetop+SqIvHMg2JYStNa2TSgXDZgwgTXxghBAJ3zo7xPgf+byw7VFEh0VFro1l-nQOLu5doNVxJIW6t3iFFSgo3ofghTBdcWSNxsh8kDA8J80Q9c28F8bgVOdhX51FV563BuBdG-t7K+JFcne1a48JN34L+yfe97GDmTP-AhDBZZ4U0RLnpZ2rz8PwOxtzPj9N-XAPbdgGuwUfwXTk4AlvobYTcM5ofB-fcNpwfb5h8T23zU5POOU4QOEYOLSvDWZ+WtxAfxAV80D3ye8MmaMZdr1PwXmo6A8H-mL2H8PEcy6EvHXjQ5ShSb5OC5GwZ2WBGHOzW4DIkZSgPzXgnq3ifgIH-CTJfhLtftLnPuSmRrxrTveACKcFJlknDMKOcFfAkD6GRkgVXtzofkAYbraKxCLjiBAZLpuJvLfk6itt1n6HnrEPGnAg8JfCMj4FEF4PpnrhPGAGQAwGxjGtQe2iRJ8OUC3FJEKFJuzNutNNkGEL6CJNrngU3gxoSFQKIugKDgIRxs7lnhwktsjKyKUEKF4EXmfJ0lSmIbGF6NgbGHrmoagBoVoeDiTISKSHQBvNpvoaUIYSUB+KYcGKaLdpIffPFFJm8GcPYeofgmTuxtpr8IOoyF0iUFJicGYb2ChF2FcJ0t6KKOwlEY4TEf4r0ChriG4R4VQTAUJNEFkByFJLkN8CcGkYEeFjeNFj3JYj9gASVllg4aopVgKqbp5pbg5s3n0VEuolVmnrohnlQvPqcA1lthJH4F4NkRjqaHeEcmRmyitFGO9pUN0VRLzuMZHqoPlrnCKsEiMVNqodEacYStMcSrMWStUWcPXEsXEJvmsYESUKwTkZEFJnkF6PvtXj0WMdEQ3jOtcccdER3v0oyJvrfMsacOvscD+JfD+OfCcHyMYg-IcYoLzmapoYQgAGoeHEg8BHgog1p1qNoYZCE1wChUaxBhBSZehRjppnxl6fqBwFD9j8y674lW7N5EnOGkG1oNpQTaaPBMjhC56tyDK3hjgGxgqCiHoK6BRxhCmjEMZmop7uZDFooTYEEinhr6mO7BaZ7z4iSoSRCihRCZD+iollBvG3xlDGFPaMrcFmkDFnHR6BIFzQlZZ6m+kPFOwJKWlzFug2nfj2k9ZOkGzGKBBqp5Bsh+DFDemIqQnGmAGmmIraYxyXwgqih-A8JCjZJUbdanBXBxCbLTSZmPpxEMl0whCsGu6FA44q4ZqBj4S5BhhJxgq3Bc4qHyaTpgGi7Q5X5S6VG6Hz5fj1wSgJBB67aGyyTvAs66YRD-CAjak3GjnSqgE8CuHuGeHNnHD8gXC7GijrQ1E-5rkrRqmdg3xdJvANmHmobkjoZaZnkSSejlAZLNzbIVnFDRQSQXK-imw3BvnvyfzUk-xYh-z1ILzAJnlnCqltbSarYiiEZww+AoQFDNhFBCgGbHq7mEkHmkgw7kg4gTxojVraYtglnxpsmfEYTZL3D+DxQBgOnXhqR66GSTGIiz6zlujDh-CXxdJ-DlDDjWZWJjQdn1wswSglBsr74aSYAUDgSrIoDXEKgLDtDQjdDSmRyoSSa7zJaRjpGvBdJZBxQhCFAsz8i2b4E7SQgGUAzdBgSQDXZMILkoEhCJyu4Gzol5oxS5HgoFD8J6Upg2wajXaMhY7BD2KhTBB3B+63Z5C9y-4Sjsqco0SED0S5TMSwAojFHXblCejbG7yGwshxDOm-gBQkSdINHxpJZjLPwaheUQDaamitz9JfDVWMjgoxjPgdZJarpzT0zNjnJ5Ulh0SMTFXXZfBZBhTgocV+EshwJ8ju7dKXC3CWy7muKexHTEnt5nkhwmKGwkRgphBhCFDtwfqRg1WQyFCF7tW3LHWtSTE+LlTab9hq5qRnAchfAgr0q4WdJvaRjegJCu4ciCmglFwfV2xmRVIvBVE7xswmJfqfjXDIzRBWX97ZAAjxS3xox8nvUezI3kCGhiBnXo00ISRRT8bxrIxChsw9Lg2GzvjIxYGOKhQU2ZylzSmJSmXXVjgiT3VwwxhZDK54UPBA2h6HVlKTL4KnV-VxC1HskAalBCbxaazLqj4qV3DOUYpHXlL9HfWxIwB-WZAfB+hfBEURBcy9Isi7rRYPB41-AC2vTm34Ko1-VRAfDGJgxPZIwkQMrehFkRBukZCZDe3hIrLU2oC01-Usi8bRBnIhR+qokIm8arZfqlDXDDLx13IeJ-WRgkYdgbbmXO0Zoa2hjQykYMgFoI3Fomrzp4rRVQA+UMxHp-AFCV4SQMpJkEbiiRj9zw0uV1RzpSp4r+3nXDjnD93GJIltghQHJIzZA+C6ZxDJx4mt2Szt2z2kDloQBo0iVCScEfC21P63gpG+4Zo2knBgrFAnxA1jrcod1NA0100X1xokTByBjDhGK5DehWWZoupIxhBeBti6Yf0ToLqoU-5yHbYD2Zo51zQmJ7JswSSL2oJkVZa+ZKZq1nm9V0JAODWDkjWepYRvE4mF1Iww2RB65EP3o5wMVihFmBi+pIHcNEYthigih2InB3hSQsMjb3FI5d4hBII31vC-hEZkbRRAm3CSglDDlBnN6sNIaWTJ2-1Wluhw2oRERy156Rj8NMiLmPhRj2L4MH06nDblbsA9V9WBADUhBDVB6jXrZuqMyGx9U3BeBxCT7AFG4kP01NhSZRRGYNzG1oWeAvjkOPAAksg80AjKGaMHbH5G7sOoVCOXxeDa7Dga3h0ZphDc3FAKkAjIykX2N7mE7ZN26hnXb8hMiVM-ihx+iwLdlL2xhpp2nxxiMEPN514Xa6Mp3nWdLLRDljjszJFYTZIijRTIzGIrTJN3AglT1HGEFJ62gFmqkxNXBxMunv5ZD9iBiF2AnTSnAQqZN-aNNwDXY-AfAxhlDe5ChkZbpwxJzLPii70pFJTDO6m8EMAMVtMiPTQbRfhRDbryQAMO24PB4FFOGWQ9VnAfAQ2IvKVw2LPRTSbCgWyRjCh8JAvyYnG5MROIDCj+CRYxjLrKRPBwy9UmLMlf4-hJqijIsTHeKqDlWdy-giipHGIRGBHyRCjhgiQK4gZctJ0TOUsIAchRSRTf7iZiGonMsRanJYRuryHxpctov+6YsMgRUdlBCBHJPvisjWHXiBzMoNkPoFlZBrQ5JdJEWY2Jn9KpHTTiR7z2sUt-1qx3AChP5hxFANwKO4V3AfB7x+BpMZmktXohmW3d1nn43ZCY3QxxBcX8jBWeh6wlA1n963OQb1PsBmrjP6NRlCRBtFmER1XhucnKonBuNSU617GvkJtluIPyvxpUprTChD7slRiyScLvF5APDi0FAm13NXoCXiLeWTOUolA4Oo7swLRjUro5rszYFEWRW7n+sGOX0cGWtB6Kk-prmsjLM8KsxQxDP2MuOtkUMeNUOdKep9hvERHe5Z1OV3hVBVBAA */
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
        regions: [],
        selectedRegion: undefined,
        organisms: undefined,
        trainingProgram: undefined,
      },
      // TODO remove this hack when url handler is done
      initial: window.location.pathname.endsWith("confirm-registration")
        ? "projectHomeLoading"
        : "projectContact",
      id: "mainMachine",
      states: {
        loginHome: {
          initial: "idle",
          states: {
            idle: {
              on: {
                BACK: {
                  actions: ["resetError", "navigatePrevious"],
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
            id: "searching-region-certification",
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
            SELECT_REGION: {
              actions: "selectingRegion",
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
            SELECT_REGION: {
              actions: "selectingRegion",
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
          always: [{ target: "projectHome.loading" }],
        },
        projectHome: {
          initial: "ready",
          states: {
            loading: {
              invoke: {
                src: "initializeApp",
                onDone: [
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
                    actions: ["loadCandidacy"],
                    target: "ready",
                  },
                ],
                onError: [
                  {
                    actions: ["loadFakeCandidacy"],
                    target: "fakeLoading",
                  } /**
                  {
                    actions: assign({
                      error: (_, _event) => "Une erreur est survenue.",
                      direction: (_context, _event) => "next",
                    }),
                    target: "retry",
                  },*/,
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
            BACK: [
              {
                actions: [
                  "navigatePrevious",
                  assign({
                    certification: (context, _event) => context.certification,
                  }),
                ],
                cond: (context) => {
                  return context.candidacyStatus === "PROJET";
                },
                target: "#mainMachine.submissionHome.ready",
              },
              {
                actions: [
                  "navigatePrevious",
                  assign({
                    certification: (context, _event) => context.certification,
                    candidacyStatus: (_context, _event) => "PROJET",
                  }),
                ],
                cond: (context) => {
                  return context.candidacyStatus === "CANDIDATURE_VALIDEE";
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
            EDIT_ORGANISM: {
              actions: "navigateNext",
              target: "projectOrganism",
            },
            CLOSE_SELECTED_CERTIFICATION: [
              {
                actions: "navigateNext",
                target: "loadingCertifications",
                cond: "isRegionSelected",
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
              actions: "navigatePrevious",
              target: "#mainMachine.submissionHome.ready",
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
            regions: event.data.regions,
            selectedRegion: event.data.regions.find(
              (region: Region) => region.id === event.data.candidacy.regionId
            ),
            trainingProgram: event.data.candidacy.trainingProgram,
          };
        }),
        loadFakeCandidacy: assign((_context, _event) => {
          return {
            candidacyId: "1ba56a5a-2e62-4357-8fa4-267e426bfba8",
            certification: {
              id: "0df82044-afac-4f23-a98c-d8c22eeb48f2",
              codeRncp: "34691",
              description: "",
              status: "AVAILABLE",
              label:
                "Titre à finalité professionnelle Assistant maternel / Garde d'enfants",
              summary:
                "L'Assistant maternel ou le Garde d'enfants prend en charge des enfants de la naissance à l'adolescence. Le mode de garde d'enfants chez un assistant maternel ou chez le particulier employeur est en France le premier mode de garde des enfants de moins de 3 ans, en dehors des gardes par la famille.",
            },
            candidacyCreatedAt: new Date(),
            candidacyStatus: "PROJET",
            regionId: "afb6d7a5-baef-4365-bf3d-568f3a32675a",
            experiences: { rest: [] },
            goals: [
              {
                id: "goal1",
                checked: false,
                label: "Goal 1",
                order: 1,
              },
              {
                id: "goal2",
                checked: false,
                label: "Goal 2",
                order: 2,
              },
            ],
            regions: [
              {
                id: "region1",
                code: "1",
                label: "Région 1",
              },
              {
                id: "region2",
                code: "2",
                label: "Région 2",
              },
            ],
          };
        }),
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
        selectingRegion: assign({
          selectedRegion: (context, event) => {
            const typedEvent = event as SelectRegion;
            return context.regions.find(
              (region: Region) => region.code === typedEvent.regionCode
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
        isRegionSelected: (context, _event) => {
          return !!context.selectedRegion;
        },
        isTrainingProgramSubmitted: (_context, event) => {
          const typedEvent = event as DoneInvokeEvent<any>;
          const isSubmitted =
            typedEvent.data.candidacy?.candidacyStatus === "PARCOURS_ENVOYE";
          return !!isSubmitted;
        },
        isTrainingProgramConfirmed: (_context, event) => {
          const typedEvent = event as DoneInvokeEvent<any>;
          const isConfirmed =
            typedEvent.data.candidacy?.candidacyStatus === "PARCOURS_CONFIRME";
          return !!isConfirmed;
        },
      },
    }
  );
