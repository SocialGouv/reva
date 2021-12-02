import { saveUser } from '../auth/data'

const argon2 = require('argon2')
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

export const saveCandidateSurvey = async (survey: any) => {
  const client = await pg.client()

  try {

    await client.query(`BEGIN`)

    const { rows: userRows } = await client.query(`
      SELECT u.id
      FROM users u
      WHERE u.email = $1;
    `, [survey.candidate.email]);

    let userId
    if (!userRows.length) {
      userId = await saveUser({
        email: survey.candidate.email,
        firstname: survey.candidate.firstname,
        lastname: survey.candidate.lastname,
        phoneNumber: survey.candidate.phoneNumber,
        password: await argon2.hash('' + Date.now()),
        roles: ['candidate'],
        cohortes: []
      })
    } else {
      userId = userRows[0].id
    }

    const { rows: cohorteRows } = await client.query(`
      SELECT cohorte_id as id
      FROM cohortes_diplomes_cities
      WHERE diplome_id = $1
      and city_id = $2
      `, [survey.candidate.diplome, survey.candidate.cohorte])

    if (!cohorteRows.length) {
      throw new Error('Cohorte not found')
    }

    const cohorteId = cohorteRows[0].id

    const { rows: candidacyRows } = await client.query(`
      SELECT c.id
      FROM candidacies c
      WHERE c.user_id = $1
      AND c.diplome_id = $2
      AND c.city_id = $3
      AND cohorte_id = $4;
    `, [userId, survey.candidate.diplome, survey.candidate.cohorte, cohorteId])

    
    let candidacyId
    if (!candidacyRows.length) {
      const { rows: insertedRows } = await client.query(`
        INSERT INTO candidacies (user_id, cohorte_id, diplome_id, city_id)
        VALUES ($1, $2, $3, $4) RETURNING id;
      `, [userId, cohorteId, survey.candidate.diplome, survey.candidate.cohorte])
      candidacyId = insertedRows[0].id
    } else {
      candidacyId = candidacyRows[0].id
    }

    await client.query(
      `INSERT INTO candidate_answers(id, survey_id, candidacy_id, answers, score)
      VALUES (uuid_generate_v4(), $1, $2, $3, $4);
      `,
      [survey.surveyId, candidacyId, survey.answers, survey.score]
    )

    return await client.query(`COMMIT`)

  } catch (e) {
    await client.query(`ROLLBACK`)
    throw e
  } finally {
    client.release()
  }
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