import { assign } from 'xstate'
import { createModel } from 'xstate/lib/model'
import { Survey, getSurvey } from '~/services/survey'

const onBoardingModel = createModel(
  {
    survey: null as unknown as Survey,
    useSatisfaction: false,
    error: null as unknown as string | null,
  },
  {
    events: {
      START: () => ({}),
      QUESTIONS_ANSWERED: () => ({}),
    },
  }
)

export const onBoardingMachine = onBoardingModel.createMachine({
  id: 'onBoarding',
  initial: 'welcome',
  context: onBoardingModel.initialContext,
  states: {
    welcome: {
      initial: 'loading',
      states: {
        loading: {
          invoke: {
            id: 'getSurvey',
            src: (_context: any, _event: any) => getSurvey,
            onDone: {
              target: 'success',
              actions: assign({
                survey: (_context, event) => event.data as Survey,
                error: (_context, event) =>
                  event.data.questions.length === 0 ? 'Pas de questions' : null,
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
        START: 'survey',
      },
    },
    survey: {
      on: {
        QUESTIONS_ANSWERED: 'end',
      },
    },
    end: {},
  },
})
