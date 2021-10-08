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
