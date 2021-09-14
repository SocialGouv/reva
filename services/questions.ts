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

export const getQuestions = async () => {
  const result = await axios.get('/api/questions')
  return result.data as UserQuestion[]
}
