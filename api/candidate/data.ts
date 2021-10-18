import { isAdmin } from '../auth/data'

const pg = require('../pg')

export const getCandidates = async (cohorteId: string) => {
  let query = `
  SELECT c.candidate, to_json(co.*) as cohorte, to_json(di.*) as diplome 
  FROM candidate_answers c 
  INNER JOIN cohortes co ON c.candidate->>'cohorte' = co.id::text
  INNER JOIN diplomes di ON c.candidate->>'diplome' = di.id::text
  `
  const parameters = []
  if (!isAdmin(cohorteId)) {
    query = `${query} WHERE c.candidate->>'cohorte' = $1`
    parameters.push(cohorteId)
  }

  const { rows } = await pg.query(query, parameters)

  return rows.map((r: any) => ({
    ...r.candidate,
    cohorte: r.cohorte,
    diplome: r.diplome,
  }))
}
