import axios from 'axios'

export interface Answer {
  id: string
  label: string
  description?: string
  requireAdditionalInformation: boolean
  order: number
}

export interface Question {
  id: string
  label: string
  order: number
  answers: Answer[]
}

export interface UserQuestion extends Question {
  satisfactionQuestion: Question
}

export interface Survey {
  id: string
  latest: boolean
  questions: UserQuestion[]
}

export const getQuestions = async () => {
  const result = await axios.get('/api/surveys/latest')
  return result.data.questions as UserQuestion[]
}

export const getSurvey = async () => {
  const result = await axios.get('/api/surveys/latest')
  return result.data as Survey
}

export const postQuestions = ({
  surveyId,
  answers,
  email,
}: {
  surveyId: string
  answers: any
  email: string
}) => {
  return axios.post('/api/questions', { surveyId, answers, email })
}
