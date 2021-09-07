import { createMachine } from 'xstate'

const fetchQuestions = () => {

}

export const questionsMachine = createMachine({
  id: 'questions',
  initial: 'loading',
  context: {
    previousQuestions: [],
    currentQuestion: undefined,
    nextQuestions: [],
    answers: [],
    nbQuestions: 0,
  },
  states: {
    loading: {
      entry: 'fechQuestions',
    },
    idle: {
      on: { TOGGLE: 'loading' },
    },
  },
})
