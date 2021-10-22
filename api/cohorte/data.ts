const pg = require('../pg')

export const getCohortes = async () => {
  const query = `
  SELECT 
    id,
    label,
    created_at,
    updated_at
  FROM cohortes;`

  const { rows } = await pg.query(query, [])

  return rows.map((r: any) => ({
    ...r,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}
