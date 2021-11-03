import { isAdmin } from '../auth/data'

const pg = require('../pg')

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
    ARRAY_AGG(c.created_at ORDER BY c.created_at) as survey_dates
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

  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }

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
    surveyDates: r.survey_dates.map((d: Date) =>
      d.toLocaleDateString('fr-FR', dateOptions)
    ),
  }))
}
