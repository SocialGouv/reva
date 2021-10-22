const pg = require('../pg')

export const getDiplomes = async () => {
  const query = `
  SELECT 
    id,
    label,
    created_at,
    updated_at
  FROM diplomes;`

  const { rows } = await pg.query(query, [])

  return rows.map((r: any) => ({
    ...r,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }))
}
