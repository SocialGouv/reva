import { isAdminMiddleware } from '../auth'
import { getMeasures, getMeasuresAnswers } from '../score/data'
import { calculateScore, generateMeasuresAnswersMap } from '../score/scoring'
import { getLatestSurvey, getSurveys, saveCandidateSurvey } from './data'
const surveyRouter = require('express').Router()
const yup = require('yup')

surveyRouter.get('/surveys/latest', async (_req: any, res: any) => {
  const survey = await getLatestSurvey()

  if (!survey) {
    return res.status(404).send()
  }

  res.json(survey)
})

surveyRouter.post('/surveys/:id/candidates', async (req: any, res: any) => {
  const schema = yup.object().shape({
    surveyId: yup.string().required(),
    answers: yup.object().required(),
    candidate: yup
      .object()
      .required()
      .shape({
        email: yup.string().email().required(),
        firstname: yup.string().required(),
        lastname: yup.string().required(),
        diplome: yup.string().required(),
        cohorte: yup.string().required(),
        phoneNumber: yup
          .string()
          .matches(/^[0-9]{10}$/, 'Numéro de téléphone invalide.'),
      }),
  })

  const isValid = await schema.isValid(req.body)

  if (!isValid) {
    res.status(500).send('Bad format')
  } else {
    try {

      const measures = await getMeasures()
      const measuresAnswers = await getMeasuresAnswers()
      const measuresMap = generateMeasuresAnswersMap(measuresAnswers)

      const score = calculateScore(measures, measuresMap, req.body)
      await saveCandidateSurvey({ ...req.body, score })
      res.status(200).send()
    } catch (e) {
      res.status(500).send('An error occured while saving survey')
    }
  }
})

const sortByOrder = (
  elementA: { order: number },
  elementB: { order: number }
) => elementA.order < elementB.order

const reduceSurvey = (survey: any) => {
  return survey.questions
    .sort(sortByOrder)
    .reduce((memo: any, question: any) => {
      const rows = reduceQuestion(survey.id, survey.version, question)
      return [...memo, rows]
    }, [])
}

const reduceQuestion = (
  surveyId: any,
  surveyVersion: number,
  question: any
) => {
  const answersLabel = question.answers
    .sort(sortByOrder)
    .map((r: any) => r.label)
    .join(',')

  const satisfactionAnswersLabel = question.satisfactionQuestion.answers
    .sort(sortByOrder)
    .map((r: any) => r.label)
    .join(',')

  const value = {
    surveyId,
    version: surveyVersion,
    order: question.order,
    questionId: question.id,
    questionLabel: question.label,
    questionType: question.multiValue ? 'multiple' : 'simple',
    questionAnswers: answersLabel,
    satisfactionLabel: question.satisfactionQuestion.label,
    satisfactionAnswers: satisfactionAnswersLabel,
  }
  return value
}

surveyRouter.get('/surveys', isAdminMiddleware, async (_req: any, res: any) => {
  const surveys = await getSurveys()

  const rows = surveys.reduce((memo: any, survey: any, index: number) => {
    // TODO Get the version for SQL
    const surveyRows = reduceSurvey({ ...survey, version: index + 1 })
    return [...memo, ...surveyRows]
  }, [])

  return res.json(rows)
})

export default surveyRouter
