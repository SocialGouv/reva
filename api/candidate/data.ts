import { isAdmin } from '../auth/data'

const pg = require('../pg')

export const getCandidates = async (cohorteId: string) => {
  let query = `SELECT c.candidate FROM candidate_answers c`
  const parameters = []
  if (!isAdmin(cohorteId)) {
    query = `${query} WHERE c.candidate->>'cohorte' = $1`
    parameters.push(cohorteId)
  }

  const { rows } = await pg.query(query, parameters)

  return rows.map((r: any) => r.candidate)
}
