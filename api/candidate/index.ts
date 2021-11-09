import { isAdminMiddleware } from '../auth'
import { jwtMiddleware } from '../auth/jwt'
import { getSurveys } from '../survey/data'
import { getCandidateAnswers, getCandidates } from './data'

const candidateRouter = require('express').Router()

candidateRouter.get(
  '/candidates',
  jwtMiddleware,
  async (req: any, res: any) => {
    const candidates = await getCandidates(req.user)

    if (!candidates.length) {
      return res.status(404).send()
    }

    res.json(candidates)
  }
)

candidateRouter.get(
  '/candidates/answers',
  isAdminMiddleware,
  async (req: any, res: any) => {

    const surveys = await getSurveys()

    // We create a map to easily get the order of a specific question for a specific survey
    // the key is survey_id-question_id and the value is the order
    const surveysQuestionsMap = new Map(surveys.reduce((memo: any, survey: any) => {
      const questions = survey.questions
      return [...memo, ...questions.map((q: any) => [`${survey.id}-${q.id}`, q.order])]
    }, []))

    const candidatesAnswers = await getCandidateAnswers(req.user)

    if (!candidatesAnswers.length) {
      return res.status(404).send()
    }

    const flattenCandidatesAnswers = candidatesAnswers.map((candidateAnswers: any) => {

      const candidateInfos = {
        candidatureId: candidateAnswers.id,
        surveyId: candidateAnswers.survey_id,
        email: candidateAnswers.candidate.email,
        cohorte: candidateAnswers.cohorte_label
      } 

      return Object.entries(candidateAnswers.answers)
        .reduce((memo: any, [key, questionAnswer]: any) => {
          const currentQuestionOrder = surveysQuestionsMap.get(`${candidateAnswers.survey_id}-${key}`)

          let answer = ''
          let satisfactionAnswer = ''
          let satisfactionDetail = ''
          // In the 1st version of the survey we can't have multiple answer, 
          // that's why we deal with the answers attribute
          // it should be not necessary anymore when the data will be cleaned

          if (questionAnswer.answer) {
            if (questionAnswer.answer.answers) {
              answer = questionAnswer.answer.answers.map((a: any) => a.label).join(' - ')
              if (questionAnswer.satisfactionAnswer) {
                satisfactionAnswer = questionAnswer.satisfactionAnswer.answers.map((a: any) => a.label).join(' - ')
                satisfactionDetail = questionAnswer.satisfactionAnswer.answers.map((a: any) => a.additionalInformation).join(' - ')
              }
            } else {
              answer = questionAnswer.answer.label
              if (questionAnswer.satisfactionAnswer) {
                satisfactionAnswer = questionAnswer.satisfactionAnswer.label
                satisfactionDetail = questionAnswer.satisfactionAnswer.additionalInformation
              }
            }
          }

          return {
            ...memo, 
            [`question${currentQuestionOrder}`]: answer, 
            [`satisfaction${currentQuestionOrder}`]: satisfactionAnswer, 
            [`satisfactionDetail${currentQuestionOrder}`]: satisfactionDetail
          }
        }, candidateInfos)  
    })

    res.json(flattenCandidatesAnswers)
  }
)

export default candidateRouter
