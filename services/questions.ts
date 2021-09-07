import axios from 'axios'

export interface Answer {
  id: string
  label: string
  order: number
}

export interface SatisfactionQuestion {
  label: string
  answers: Answer[]
}

export interface Question {
  id: string
  label: string
  order: number
  answers: Answer[]
  satisfactionQuestion: SatisfactionQuestion
}

export const getQuestions = async () => {
  const result = await axios.get('/api/questions')
  return result.data as Question[]
}
