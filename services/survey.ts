import axios from 'axios'

export interface Answer {
  id: string
  label: string
  description?: string
  requireAdditionalInformation: boolean
  additionalInformation: string | null
  order: number
}

export interface Question {
  id: string
  label: string
  order: number
  answers: Answer[]
  multiValue: boolean
}

export interface UserQuestion extends Question {
  satisfactionQuestion: Question
}

export interface Survey {
  id: string
  latest: boolean
  questions: UserQuestion[]
}

export interface Candidate {
  email: string
  firstname: string
  lastname: string
  phoneNumber: string
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
  candidate,
}: {
  surveyId: string
  answers: any
  candidate: Candidate
}) => {
  return axios.post('/api/surveys/latest/candidates', {
    surveyId,
    answers,
    candidate,
  })
}
