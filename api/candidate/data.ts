import { isAdmin } from '../auth/data'

const pg = require('../pg')

const dateOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
}

function createSurvey(survey: { grades: { obtainment: number, profile: number }, createdAt: string }) {
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
      cs.candidacy_id,
      ARRAY_AGG(json_build_object('status',cs.status,'createdAt',cs.created_at)) as statuses
    FROM candidacies_statuses cs
    GROUP BY cs.candidacy_id    
  `

  const { rows: candidaciesStatuses } = await pg.query(query, [])

  query = `
    SELECT
      c.id,
      u.email,
      u.firstname,
      u.lastname,
      u.phone,
      c.cohorte_id,
      ci.id as city_id, 
      ci.label as city_label, 
      ci.region as city_region,
      di.id as diplome_id, 
      di.label as diplome_label,
      ARRAY_AGG(json_build_object('grades',ca.score->'grades','createdAt',ca.created_at) ORDER BY ca.created_at DESC) as survey_dates
      FROM candidacies c
      INNER JOIN users u ON u.id = c.user_id
      INNER JOIN candidate_answers ca ON ca.candidacy_id = c.id
      INNER JOIN cities ci ON ci.id = c.city_id
      INNER JOIN diplomes di ON di.id = c.diplome_id
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
    GROUP BY c.id, u.email, u.firstname, u.lastname, u.phone, cohorte_id, ci.id, ci.label, ci.region, di.id, di.label
    ORDER BY u.lastname
    `

  const { rows } = await pg.query(query, parameters)

  return rows.map((r: any) => ({
    email: r.email,
    firstname: r.firstname,
    lastname: r.lastname,
    phoneNumber: r.phone || '',
    cohorte: r.cohorte_id,
    city: {
      id: r.city_id,
      label: r.city_label,
      region: r.city_region,
    },
    diplome: {
      id: r.diplome_id,
      label: r.diplome_label,
    },
    metaSkill: [],
    statuses: candidaciesStatuses.filter((candidacyStatuses: any) => candidacyStatuses.candidacy_id === r.id)
      .flatMap((cs: any) => cs.statuses)
      .map((cs: any) => {
        const createdAtDate = new Date(cs.createdAt)

        return {
          name: cs.status,
          date: createdAtDate.toLocaleDateString('fr-FR', dateOptions),
          timestamp: createdAtDate.getTime(),
        }
      }),
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
    ca.id,
    ca.survey_id,
    co.label as cohorte_label,
    ca.answers,
    json_build_object('email',u.email,'firstname',u.firstname, 'lastname', u.lastname, 'phoneNumber',u.phone) as candidate,
    ci.id as city_id, 
    ci.label as city_label, 
    ci.region as city_region, 
    di.id as diplome_id, 
    di.label as diplome_label, 
    ca.created_at as last_created_at
  FROM candidate_answers ca
  INNER JOIN candidacies c ON c.id = ca.candidacy_id
  INNER JOIN users u ON u.id = c.user_id
  INNER JOIN cities ci ON ci.id = c.city_id
  INNER JOIN diplomes di ON di.id = c.diplome_id
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
