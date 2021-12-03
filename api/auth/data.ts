const pg = require('../pg')

const ALLOWED_ROLES = ['admin']

export const saveUser = async (user: any) => {

  const client = await pg.client()

  try {
    await client.query('BEGIN')
    const result = await client.query(
      'INSERT INTO users(id, email, firstname, lastname, password, phone) VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5) RETURNING id;',
      [user.email, user.firstname, user.lastname, user.password, user.phoneNumber]
    )

    const userId = result.rows[0].id

    await Promise.all(
      user.cohortes.map((cohorte: string) =>
        client.query(
          `INSERT INTO users_cohortes(user_id, cohorte_id) 
          SELECT $1, co.id
          FROM cohortes co
          WHERE co.label = $2;`,
          [userId, cohorte]
        )
      )
    )

    await Promise.all(
      user.roles.filter(isAllowedRole).map((role: string) =>
        client.query(
          `INSERT INTO users_roles(user_id, role_id) 
          VALUES ($1, $2);`,
          [userId, role]
        )
      )
    )


    await client.query('COMMIT')
    return userId
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  }
}

export const getUsers = async () => {
  const { rows } = await pg.query(
    'SELECT u.*, ur.* FROM users u, users_roles ur WHERE u.id = ur.user_id;',
    []
  )

  return rows
}

export const getUserById = async (id: string) => {
  const { rows } = await pg.query(
    `SELECT u.*, jsonb_agg((ur.*)) as roles 
    FROM users u
    LEFT JOIN users_roles ur  ON u.id = ur.user_id 
    WHERE u.id = $1 
    GROUP BY u.id;`,
    [id]
  )

  if (!rows.length) {
    return null
  }

  const user = rows[0]
  return { ...user, roles: user.roles.filter((r: any) => r !== null) }
}

export const getUserByEmail = async (email: string) => {
  const { rows } = await pg.query(
    'SELECT u.* FROM users u WHERE u.email = $1 LIMIT 1;',
    [email]
  )

  if (!rows.length) {
    return null
  }

  return rows[0]
}

export const isAdmin = (roles: string[]) => roles.includes('admin')

export const isAllowedRole = (role: string) => ALLOWED_ROLES.includes(role)
