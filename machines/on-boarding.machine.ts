import { assign, createMachine } from 'xstate'
import { getQuestions } from '~/services/questions'

export const onBoardingMachine = createMachine({
  id: 'onBoarding',
  initial: 'welcome',
  context: {
    questions: [],
    error: null,
  },
  states: {
    welcome: {
      initial: 'loading',
      states: {
        loading: {
          invoke: {
            id: 'getQuestions',
            src: (_context: any, _event: any) => getQuestions,
            onDone: {
              target: 'success',
              actions: assign({
                questions: (_context, event) => event.data,
                error: (_context, event) =>
                  event.data.length === 0 ? 'Pas de questions' : null,
              }),
            },
            onError: {
              target: 'failure',
              actions: assign({ error: (_context, event) => event.data }),
            },
          },
        },
        idle: {},
        success: {},
        failure: {},
      },
      on: {
        START: 'questions',
      },
    },
    questions: {
      on: {
        QUESTIONS_ANSWERED: 'end',
      },
    },
    end: {},
  },
})
