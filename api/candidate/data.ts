import { isAdmin } from '../auth/data'

const pg = require('../pg')

function createSurvey(survey: { grades: { obtainment: number, profile: number }, createdAt: string }) {
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }

  const createdAtDate = new Date(survey.createdAt)

  return {
    date: createdAtDate.toLocaleDateString('fr-FR', dateOptions),
    grades: survey.grades ? {
      obtainment: letterFromScore(survey.grades.obtainment),
      profile: letterFromScore(survey.grades.profile),
    } : { obtainment: 'unknown', profile: 'unknown' },
    timestamp: createdAtDate.getTime(),
  }
}

export const getCandidates = async (user: {
  id: string
  // eslint-disable-next-line camelcase
  roles: { role_id: string }[]
}) => {
  let query = `
  SELECT 
    c.candidate, 
    ci.id as city_id, 
    ci.label as city_label, 
    ci.region as city_region, 
    di.id as diplome_id, 
    di.label as diplome_label, 
    ARRAY_AGG(json_build_object('grades',c.score->'grades','createdAt',c.created_at) ORDER BY c.created_at DESC) as survey_dates
  FROM candidate_answers c
  INNER JOIN cities ci ON c.candidate->>'cohorte' = ci.id::text
  INNER JOIN diplomes di ON c.candidate->>'diplome' = di.id::text
  `
  const parameters = []
  if (!isAdmin(user.roles.map((r) => r.role_id))) {
    query = `${query} 
    INNER JOIN cohortes_diplomes_cities cdc ON ci.id = cdc.city_id AND di.id = cdc.diplome_id
    INNER JOIN users_cohortes uc ON uc.cohorte_id = cdc.cohorte_id AND uc.user_id = $1`
    parameters.push(user.id)
  }

  query = `
    ${query}
    GROUP BY c.candidate, ci.id, ci.label, ci.region, di.id, di.label
    ORDER BY c.candidate->>'lastname'
    `

  const { rows } = await pg.query(query, parameters)

  return rows.map((r: any) => ({
    ...r.candidate,
    city: {
      id: r.city_id,
      label: r.city_label,
      region: r.city_region,
    },
    diplome: {
      id: r.diplome_id,
      label: r.diplome_label,
    },
    status: [],
    surveys: r.survey_dates.map(createSurvey),
  }))
}

export const getCandidateAnswers = async (user: {
  id: string
  // eslint-disable-next-line camelcase
  roles: { role_id: string }[]
}) => {
  let query = `
  SELECT
    c.id,
    c.survey_id,
    co.label as cohorte_label,
    c.answers,
    c.candidate, 
    ci.id as city_id, 
    ci.label as city_label, 
    ci.region as city_region, 
    di.id as diplome_id, 
    di.label as diplome_label, 
    c.created_at as last_created_at
  FROM candidate_answers c
  INNER JOIN cities ci ON c.candidate->>'cohorte' = ci.id::text
  INNER JOIN diplomes di ON c.candidate->>'diplome' = di.id::text
  INNER JOIN cohortes_diplomes_cities cdc ON ci.id = cdc.city_id AND di.id = cdc.diplome_id
  INNER JOIN cohortes co ON co.id = cdc.cohorte_id
  `
  const parameters = []

  if (!isAdmin(user.roles.map((r) => r.role_id))) {
    query = `${query} 
    INNER JOIN users_cohortes uc ON uc.cohorte_id = cdc.cohorte_id AND uc.user_id = $1`
    parameters.push(user.id)
  }

  const { rows } = await pg.query(query, parameters)
  return rows
}


const letterFromScore = (score: number) => {
  switch (true) {
    case (score >= 0.89431):
      return 'A'
    case (score >= 0.72358):
      return 'B'
    case (score >= 0.44716):
      return 'C'
    default:
      return 'D'
  }
}
