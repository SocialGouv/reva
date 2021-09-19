import { assign } from 'xstate'
import { createModel } from 'xstate/lib/model'
import {
  Answer,
  Candidate,
  postQuestions,
  UserQuestion,
} from '~/services/survey'

const surveyModel = createModel(
  {
    id: null as unknown as string,
    previousQuestions: [],
    currentQuestion: null as unknown as UserQuestion,
    nextQuestions: [] as UserQuestion[],
    answers: {} as {
      [key: string]: { answer: Answer; satisfactionAnswer: Answer }
    },
    nbQuestions: 0,
    candidate: null as unknown as Candidate | null,
  },
  {
    events: {
      ANSWER_SELECTED: () => ({}),
      SATISFACTION_ANSWER_SELECTED: () => ({}),
      BACK_TO_QUESTION: () => ({}),
      SUBMIT: () => ({}),
      PREVIOUS_QUESTION: () => ({}),
      NEXT_QUESTION: () => ({}),
    },
  }
)

export const surveyMachine = surveyModel.createMachine({
  id: 'surveyMachine',
  initial: 'idle',
  context: surveyModel.initialContext,
  states: {
    idle: {
      on: {
        ANSWER_SELECTED: [
          {
            target: 'displayCloseButton',
            actions: assign((context: any, event: any) => {
              return {
                answers: {
                  ...context.answers,
                  [context.currentQuestion.id]: {
                    ...context.answers[context.currentQuestion.id],
                    answer: event.answer,
                  },
                },
              }
            }),
            cond: (context, _event) =>
              !!context.answers[context.currentQuestion?.id]
                ?.satisfactionAnswer,
          },
          {
            target: 'displaySatisfactionQuestion',
            actions: assign((context: any, event: any) => {
              return {
                answers: {
                  ...context.answers,
                  [context.currentQuestion.id]: {
                    ...context.answers[context.currentQuestion.id],
                    answer: event.answer,
                  },
                },
              }
            }),
          },
        ],
      },
    },
    displaySatisfactionQuestion: {
      on: {
        SATISFACTION_ANSWER_SELECTED: {
          target: 'displayCloseButton',
          actions: assign((context: any, event: any) => {
            return {
              answers: {
                ...context.answers,
                [context.currentQuestion.id]: {
                  ...context.answers[context.currentQuestion.id],
                  satisfactionAnswer: event.answer,
                },
              },
            }
          }),
        },
      },
    },
    displayCloseButton: {
      on: {
        SATISFACTION_ANSWER_SELECTED: {
          target: 'displayCloseButton',
          actions: assign((context: any, event: any) => {
            return {
              answers: {
                ...context.answers,
                [context.currentQuestion.id]: {
                  ...context.answers[context.currentQuestion.id],
                  satisfactionAnswer: event.answer,
                },
              },
            }
          }),
        },
      },
    },
    userInformations: {
      initial: 'idle',
      states: {
        idle: {
          on: {
            SUBMIT: {
              target: 'submittingData',
              actions: surveyModel.assign({
                candidate: (_context: any, event: any) => ({
                  email: event.email,
                  firstname: event.firstname,
                  lastname: event.lastname,
                  phoneNumber: event.phoneNumber,
                }),
              }),
            },
          },
        },
        submittingData: {
          invoke: {
            id: 'postData',
            src: (context: any, _event: any) =>
              postQuestions({
                surveyId: context.id,
                answers: context.answers,
                candidate: context.candidate,
              }),
            onDone: {
              target: 'success',
            },
            onError: {
              target: 'failure',
            },
          },
        },
        success: {},
        failure: {
          on: {
            SUBMIT: 'submittingData',
          },
        },
      },
    },

    end: {},
  },
  on: {
    BACK_TO_QUESTION: 'idle',
    PREVIOUS_QUESTION: {
      target: 'idle',
      actions: assign((context: any, _event: any) => {
        const previousQuestion = context.previousQuestions[0]
        const previousQuestions = context.previousQuestions.slice(1)
        const nextQuestions = [
          context.currentQuestion,
          ...context.nextQuestions,
        ]
        return {
          previousQuestions,
          currentQuestion: previousQuestion,
          nextQuestions,
        }
      }),
    },
    NEXT_QUESTION: [
      {
        target: 'idle',
        actions: assign((context: any, _event: any) => {
          return {
            previousQuestions: [
              ...context.previousQuestions,
              context.currentQuestion,
            ],
            currentQuestion: context.nextQuestions[0],
            nextQuestions: context.nextQuestions.slice(1),
          }
        }),
        cond: (context, _event) => !!context.nextQuestions.length,
      },
      {
        target: 'userInformations',
        actions: assign((context: any, _event: any) => {
          return {
            previousQuestions: [
              ...context.previousQuestions,
              context.currentQuestion,
            ],
            currentQuestion: null,
            nextQuestions: [],
          }
        }),
      },
    ],
  },
})
