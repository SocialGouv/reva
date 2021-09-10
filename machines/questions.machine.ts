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
                [context.currentQuestion.id]: event.id,
              },
            }
          }),
        },
      },
    },
    displaySatisfactionQuestion: {
      on: {
        SATISFACTION_ANSWER_SELECTED: 'displayCloseButton',
      },
    },
    displayCloseButton: {
      on: {
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
    },
    end: {},
  },
})
