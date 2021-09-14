import { assign, createMachine } from 'xstate'

export const questionsMachine = createMachine({
  id: 'questionsMachine',
  initial: 'idle',
  context: {
    previousQuestions: [],
    currentQuestion: null,
    nextQuestions: [],
    answers: {},
    nbQuestions: 0,
  },
  states: {
    idle: {
      on: {
        ANSWER_SELECTED: {
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
    NEXT_QUESTION: {
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
    },
  },
})
