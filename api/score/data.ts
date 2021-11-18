const pg = require('../pg')

export const getMeasuresAnswers = async () => {
  const query = `
  SELECT 
    id,
    survey_id,
    question_id,
    answer_id,
    measure_id,
    score,
    created_at,
    updated_at
  FROM measures_answers;`

  const { rows } = await pg.query(query, [])

  return rows.map((r: any) => ({
    surveyId: r.survey_id,
    questionId: r.question_id,
    answerId: r.answer_id,
    measureId: r.measure_id,
    score: r.score,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}


export const getMeasures = async () => {
  const query = `
  SELECT 
    id,
    label,
    factor,
    indicator,
    max,
    created_at,
    updated_at
  FROM measures;`

  const { rows } = await pg.query(query, [])

  return rows.map((r: any) => ({
    ...r,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}


export const getCandidateAnswers = async () => {
  const { rows } = await pg.query(
    'SELECT id, survey_id, answers, created_at, updated_at FROM candidate_answers'
  )

  return rows.map((r: any) => ({
    ...r,
    surveyId: r.survey_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}