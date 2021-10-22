const pg = require('../pg')

export const getCities = async () => {
  const query = `
  SELECT 
    id,
    label,
    region,
    created_at,
    updated_at
  FROM cities;`

  const { rows } = await pg.query(query, [])

  return rows.map((r: any) => ({
    ...r,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}
