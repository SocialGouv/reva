const pg = require('../pg')

export const saveUser = async (user: any) => {
  const result = await pg.query(
    'INSERT INTO users(id, email, firstname, lastname, password) VALUES (uuid_generate_v4(), $1, $2, $3, $4) RETURNING id;',
    [user.email, user.firstname, user.lastname, user.password]
  )

  const userId = result.rows[0].id

  return pg.query(
    'INSERT INTO users_roles(id, user_id, role_id) VALUES (uuid_generate_v4(), $1, $2);',
    [userId, user.role]
  )
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
    'SELECT u.*, ur.* FROM users u, users_roles ur WHERE u.id = ur.user_id AND u.id = $1;',
    [id]
  )

  if (!rows.length) {
    return null
  }

  return rows[0]
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

export const isAdmin = (role: string) => role === 'admin'
