import { isAdmin } from '../auth/data'

const pg = require('../pg')

export const getCandidates = async (cohorteId: string) => {
  let query = `
  SELECT c.candidate, co.id as cohorte_id, co.label as cohorte_label, co.region as cohorte_region, di.id as diplome_id, di.label as diplome_label, MAX(c.created_at) as last_created_at
  FROM candidate_answers c
  INNER JOIN cohortes co ON c.candidate->>'cohorte' = co.id::text
  INNER JOIN diplomes di ON c.candidate->>'diplome' = di.id::text
  `
  const parameters = []
  if (!isAdmin(cohorteId)) {
    query = `${query} WHERE c.candidate->>'cohorte' = $1`
    parameters.push(cohorteId)
  }

  query = `
    ${query}
    GROUP BY c.candidate, cohorte_id, cohorte_label, diplome_id, diplome_label
    ORDER BY c.candidate->>'lastname'
    `
  const { rows } = await pg.query(query, parameters)

  const dateOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  return rows.map((r: any) => ({
    ...r.candidate,
    cohorte: {
      id: r.cohorte_id,
      label: r.cohorte_label,
      region: r.cohorte_region,
    },
    diplome: {
      id: r.diplome_id,
      label: r.diplome_label,
    },
    lastCreatedAt: r.last_created_at.toLocaleDateString('fr-FR', dateOptions),
  }))
}
