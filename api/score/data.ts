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
  FROM measures_answers
  WHERE score IS NOT NULL;`

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
    `SELECT ca.id, ca.survey_id, ca.answers, ca.created_at, ca.updated_at 
    FROM candidate_answers ca, surveys s
    WHERE s.id = ca.survey_id
    AND s.latest = true;
    `
  )

  return rows.map((r: any) => ({
    ...r,
    surveyId: r.survey_id,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}