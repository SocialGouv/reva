const Pool = require('pg').Pool

const connectionString = process.env.DATABASE_URL

const pool = new Pool({
  connectionString,
})

module.exports = {
  query: (text: string, params: any) => pool.query(text, params),
  client: () => pool.connect()
}
