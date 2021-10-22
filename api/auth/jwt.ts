import { getUserById } from './data'

const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET
const issuer = process.env.JWT_ISSUER
const audience = process.env.JWT_AUDIENCE

export const jwtMiddleware = async (req: any, res: any, next: any) => {
  if (!req.headers.authorization) {
    return res.status(401).send('Unauthenticate')
  }

  const token = req.headers.authorization.substring('Bearer '.length)

  try {
    const decoded = jwt.verify(token, secret, {
      issuer,
      audience,
    })

    const userId = decoded.id

    const user = await getUserById(userId)
    if (user) {
      req.user = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        roles: user.roles,
      }
      next()
    } else {
      res.status(403).send('Unauthorized')
    }
  } catch (error) {
    res.status(403).send('Unauthorized')
  }
}

export const generateToken = (userId: string) => {
  return jwt.sign(
    {
      id: userId,
    },
    secret,
    {
      issuer,
      audience,
      expiresIn: '2d',
    }
  )
}
