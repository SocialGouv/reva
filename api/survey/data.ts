const pg = require('../pg')

export const getLatestSurvey = async () => {
  const { rows } = await pg.query(
    'SELECT * FROM surveys WHERE latest = TRUE LIMIT 1'
  )

  if (!rows.length) {
    return null
  }

  return rows[0]
}

export const saveCandidateSurvey = (survey: any) => {
  return pg.query(
    'INSERT INTO candidate_answers(id, survey_id, answers, candidate) VALUES (uuid_generate_v4(), $1, $2, $3);',
    [survey.surveyId, survey.answers, survey.candidate]
  )
}

export const getSurveys = async () => {
  const query = `
  SELECT 
    id,
    questions,
    latest,
    created_at,
    updated_at
  FROM surveys
  ORDER BY created_at ASC;`

  const { rows } = await pg.query(query, [])

  return rows.map((r: any) => ({
    ...r,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}