import { computed } from '@vue/composition-api'
import { assign } from 'xstate'
import { useMachine } from 'xstate-vue2'
import { createModel } from 'xstate/lib/model'
import {
  Candidate,
  postQuestions,
  UserAnswer,
  UserQuestion,
} from '~/services/survey'

const surveyModel = createModel(
  {
    id: null as unknown as string,
    previousQuestions: [],
    currentQuestion: undefined as unknown as UserQuestion,
    currentUserAnswer: undefined as unknown as UserAnswer | undefined,
    nextQuestions: [] as UserQuestion[],
    answers: {} as {
      [key: string]: { answer: UserAnswer; satisfactionAnswer: UserAnswer }
    },
    nbQuestions: 0,
    diplome: null as unknown as String | null,
    cohorte: null as unknown as string | null,
    candidate: null as unknown as Candidate | null,
    displaySatisfaction: false,
  },
  {
    events: {
      USER_ANSWER_SELECTED: (answer: UserAnswer) => ({
        answer,
      }),
      SATISFACTION_ANSWER_SELECTED: (answer: UserAnswer) => ({
        answer,
      }),
      BACK_TO_QUESTION: () => ({}),
      SUBMIT: (candidate: any) => ({ candidate }),
      PREVIOUS_QUESTION: () => ({}),
      NEXT_QUESTION: () => ({}),
    },
  }
)

const saveAnswerAndGoNext = assign((context: any, _event: any) => {
  window.scrollTo({ top: 0 })

  const currentQuestion = context.nextQuestions[0]

  return {
    currentUserAnswer: context.answers[currentQuestion.id]?.answer || undefined,
    answers: {
      ...context.answers,
      [context.currentQuestion.id]: {
        ...context.answers[context.currentQuestion.id],
        answer: context.currentUserAnswer,
      },
    },
    previousQuestions: [context.currentQuestion, ...context.previousQuestions],
    currentQuestion,
    nextQuestions: context.nextQuestions.slice(1),
  }
})

const goPreviousQuestion = assign((context: any, _event: any) => {
  window.scrollTo({ top: 0 })

  const currentQuestion = context.previousQuestions[0]

  return {
    currentUserAnswer: context.answers[currentQuestion.id].answer,
    answers: {
      ...context.answers,
      [context.currentQuestion.id]: {
        ...context.answers[context.currentQuestion.id],
        answer: context.currentUserAnswer,
      },
    },
    previousQuestions: context.previousQuestions.slice(1),
    currentQuestion,
    nextQuestions: [context.currentQuestion, ...context.nextQuestions],
  }
})

export const surveyMachine = surveyModel.createMachine({
  id: 'surveyMachine',
  initial: 'displayQuestion',
  context: surveyModel.initialContext,
  states: {
    displayQuestion: {
      on: {
        USER_ANSWER_SELECTED: {
          target: 'displayQuestion',
          actions: assign({
            currentUserAnswer: (_context, event: any) => event.answer,
          }),
        },
        // {
        // target: 'answerSelected',
        // actions: assign((context: any, event: any) => {
        //   return {
        //     answers: {
        //       ...context.answers,
        //       [context.currentQuestion.id]: {
        //         ...context.answers[context.currentQuestion.id],
        //         answer: event.answer,
        //       },
        //     },
        //   }
        // }),
        // },
        // ------------------
        PREVIOUS_QUESTION: {
          target: 'displayQuestion',
          actions: goPreviousQuestion,
        },

        NEXT_QUESTION: [
          {
            target: 'userInformations',
            actions: assign((context: any, _event: any) => {
              window.scrollTo({ top: 0 })
              return {
                previousQuestions: [
                  ...context.previousQuestions,
                  context.currentQuestion,
                ],
                currentQuestion: null,
                nextQuestions: [],
              }
            }),
            cond: (context, _event) =>
              !context.displaySatisfaction && !context.nextQuestions.length,
          },
          {
            target: 'displaySatisfactionQuestion',
            cond: (context) => context.displaySatisfaction,
          },
          { target: 'displayQuestion', actions: saveAnswerAndGoNext },
        ],
      },
    },
    displaySatisfactionQuestion: {
      on: {
        BACK_TO_QUESTION: {
          target: 'displayQuestion',
        },
        SATISFACTION_ANSWER_SELECTED: {
          target: 'displaySatisfactionQuestion',
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
        NEXT_QUESTION: [
          {
            target: 'userInformations',
            actions: assign((context: any, _event: any) => {
              window.scrollTo({ top: 0 })
              return {
                previousQuestions: [
                  ...context.previousQuestions,
                  context.currentQuestion,
                ],
                currentQuestion: null,
                nextQuestions: [],
              }
            }),
            cond: (context, _event) => !context.nextQuestions.length,
          },
          {
            target: 'displayQuestion',
            actions: saveAnswerAndGoNext,
          },
        ],
        PREVIOUS_QUESTION: {
          target: 'displayQuestion',
          actions: goPreviousQuestion,
        },
      },
    },

    //   displayQuestion: {
    //     on: {
    //       ANSWER_SELECTED: [
    //         {
    //           target: 'displayCloseButton',
    //           actions: assign((context: any, event: any) => {
    //             return {
    //               answers: {
    //                 ...context.answers,
    //                 [context.currentQuestion.id]: {
    //                   ...context.answers[context.currentQuestion.id],
    //                   answer: event.answer,
    //                 },
    //               },
    //             }
    //           }),
    //           cond: (context, _event) =>
    //             !!context.answers[context.currentQuestion?.id]
    //               ?.satisfactionAnswer,
    //         },
    //         {
    //           target: 'displaySatisfactionQuestion',
    //           actions: assign((context: any, event: any) => {
    //             return {
    //               answers: {
    //                 ...context.answers,
    //                 [context.currentQuestion.id]: {
    //                   ...context.answers[context.currentQuestion.id],
    //                   answer: event.answer,
    //                 },
    //               },
    //             }
    //           }),
    //         },
    //       ],
    //     },
    //   },
    //   displaySatisfactionQuestion: {
    //     on: {
    //       SATISFACTION_ANSWER_SELECTED: {
    //         target: 'displayCloseButton',
    //         actions: assign((context: any, event: any) => {
    //           return {
    //             answers: {
    //               ...context.answers,
    //               [context.currentQuestion.id]: {
    //                 ...context.answers[context.currentQuestion.id],
    //                 satisfactionAnswer: event.answer,
    //               },
    //             },
    //           }
    //         }),
    //       },
    //     },
    //   },
    //   displayCloseButton: {
    //     on: {
    //       SATISFACTION_ANSWER_SELECTED: {
    //         target: 'displayCloseButton',
    //         actions: assign((context: any, event: any) => {
    //           return {
    //             answers: {
    //               ...context.answers,
    //               [context.currentQuestion.id]: {
    //                 ...context.answers[context.currentQuestion.id],
    //                 satisfactionAnswer: event.answer,
    //               },
    //             },
    //           }
    //         }),
    //       },
    //     },
    //   },
    userInformations: {
      initial: 'displayQuestion',
      states: {
        displayQuestion: {
          on: {
            SUBMIT: {
              target: 'submittingData',
              actions: surveyModel.assign({
                candidate: (context: any, event: any) => ({
                  email: event.candidate.email,
                  firstname: event.candidate.firstname,
                  lastname: event.candidate.lastname,
                  phoneNumber: event.candidate.phoneNumber,
                  diplome: context.diplome,
                  cohorte: context.cohorte,
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
    // },
    // on: {
    //   BACK_TO_QUESTION: 'displayQuestion',
    //   PREVIOUS_QUESTION: {
    //     target: 'displayQuestion',
    //     actions: assign((context: any, _event: any) => {
    //       window.scrollTo({ top: 0 })
    //       const previousQuestion = context.previousQuestions[0]
    //       const previousQuestions = context.previousQuestions.slice(1)
    //       const nextQuestions = [
    //         context.currentQuestion,
    //         ...context.nextQuestions,
    //       ]
    //       return {
    //         previousQuestions,
    //         currentQuestion: previousQuestion,
    //         nextQuestions,
    //       }
    //     }),
    //   },
    //   NEXT_QUESTION: [
    //     {
    //       target: 'displayQuestion',
    //       actions: assign((context: any, _event: any) => {
    //         window.scrollTo({ top: 0 })
    //         return {
    //           previousQuestions: [
    //             context.currentQuestion,
    //             ...context.previousQuestions,
    //           ],
    //           currentQuestion: context.nextQuestions[0],
    //           nextQuestions: context.nextQuestions.slice(1),
    //         }
    //       }),
    //       cond: (context, _event) => !!context.nextQuestions.length,
    //     },
    //     {
    //       target: 'userInformations',
    //       actions: assign((context: any, _event: any) => {
    //         window.scrollTo({ top: 0 })
    //         return {
    //           previousQuestions: [
    //             ...context.previousQuestions,
    //             context.currentQuestion,
    //           ],
    //           currentQuestion: null,
    //           nextQuestions: [],
    //         }
    //       }),
    //     },
    //   ],
  },
})

interface SurveyMachinePayload {
  id: string
  questions: UserQuestion[]
  diplome: string
  cohorte: string
  displaySatisfaction: boolean
}

export const useSurveyMachine = ({
  id,
  questions,
  diplome,
  cohorte,
  displaySatisfaction,
}: SurveyMachinePayload) => {
  const { state, send } = useMachine(
    surveyMachine.withContext({
      id,
      previousQuestions: [],
      currentQuestion: questions[0],
      currentUserAnswer: undefined,
      nextQuestions: questions.slice(1),
      nbQuestions: questions.length,
      answers: {},
      diplome,
      cohorte,
      candidate: null,
      displaySatisfaction,
    }),
    { devTools: true }
  )

  const selectUserAnswer = (answer: UserAnswer) => {
    send({
      type: 'USER_ANSWER_SELECTED',
      answer,
    })
  }
  const selectSatisfactionAnswer = (answer: UserAnswer) =>
    send({ type: 'SATISFACTION_ANSWER_SELECTED', answer })

  const nextQuestion = () => send({ type: 'NEXT_QUESTION' })
  const previousQuestion = () => send({ type: 'PREVIOUS_QUESTION' })
  const backToQuestion = () => send({ type: 'BACK_TO_QUESTION' })
  const submit = (candidate: any) => send({ type: 'SUBMIT', candidate })

  const isDisplayingSatisfactionQuestion = computed(() =>
    state.value.matches('displaySatisfactionQuestion')
  )
  const hasPreviousQuestion = computed(
    () => !!state.value.context.previousQuestions.length
  )

  const currentUserAnswer = computed(
    () =>
      state.value.context.answers[state.value.context.currentQuestion?.id]
        ?.answer
  )

  // hasAlreadyAnswered || (!displayEnquete && isDisplayingSatisfactionQuestion)
  const canGoNext = computed(() => {
    const currentUserAnswer = state.value.context.currentUserAnswer

    if (!currentUserAnswer) {
      return false
    }

    const additionalInformationFilled =
      currentUserAnswer.additionalInformation &&
      currentUserAnswer.additionalInformation.trim() !== ''

    // satisfaction
    if (
      state.value.context.displaySatisfaction &&
      isDisplayingSatisfactionQuestion.value
    ) {
      return state.value.context.answers[state.value.context.currentQuestion.id]
        ?.satisfactionAnswer
    }

    if (state.value.context.currentQuestion.multiValue) {
      return !!currentUserAnswer.answers.length
    }

    return (
      !currentUserAnswer.answers[0].requireAdditionalInformation ||
      additionalInformationFilled
    )
  })

  return {
    state,
    selectUserAnswer,
    selectSatisfactionAnswer,
    backToQuestion,
    nextQuestion,
    previousQuestion,
    submit,
    canGoNext,
    hasPreviousQuestion,
    isDisplayingSatisfactionQuestion,
    currentUserAnswer,
  }
}
