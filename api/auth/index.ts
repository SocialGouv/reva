import { getUserByEmail, getUsers, saveUser } from './data'
import { generateToken } from './jwt'

const argon2 = require('argon2')
const authRouter = require('express').Router()
const yup = require('yup')

export const isAdminMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.substring('Bearer '.length)
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).send()
  }

  req.user = req.user || { roles: [] }
  req.user.roles = [...req.user.roles, { role_id: 'admin' }]

  next()
}

authRouter.post(
  '/auth/users',
  isAdminMiddleware,
  async (req: any, res: any) => {
    const schema = yup.object().shape({
      firstname: yup.string().required(),
      lastname: yup.string().required(),
      email: yup.string().email().required(),
      password: yup.string().required(),
      roles: yup.array().of(yup.string()).required(),
      cohortes: yup.array().of(yup.string()).required(),
    })

    const isValid = await schema.isValid(req.body)

    if (!isValid) {
      res
        .status(500)
        .send(
          'Bad format, required fields are: firstname, lastname, email, password, roles, cohortes'
        )
    } else {
      try {
        await saveUser({
          ...req.body,
          password: await argon2.hash(req.body.password),
        })
        res.status(200).send()
      } catch (e) {
        res.status(500).send('An error occurd while creating user')
      }
    }
  }
)

authRouter.get(
  '/auth/users',
  isAdminMiddleware,
  async (_req: any, res: any) => {
    const users = await getUsers()

    if (!users.length) {
      return res.status(404).send()
    }

    res.json(users)
  }
)

authRouter.post('/auth/login', async (req: any, res: any) => {
  const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required(),
  })

  const isValid = await schema.isValid(req.body)

  if (!isValid) {
    res.status(400).send('Bad format, required fields are: email, password')
  } else {
    try {
      const user = await getUserByEmail(req.body.email)

      const isVerified =
        user && (await argon2.verify(user.password, req.body.password))
      if (isVerified) {
        res.status(200).json({
          token: generateToken(user.id),
        })
      } else {
        res.status(401).send('Bad credentials')
      }
    } catch (error) {
      res.status(500).send('An error occured while trying to identify user')
    }
  }
})

if (process.env.CONTEXT && process.env.CONTEXT !== 'production') {
  getUsers()
    .then(users => {
      if (users.length !== 0) {
        console.log("Users already created")
      } else {
        return argon2.hash('1234').then((password: string) => {
          return saveUser({
            firstname: 'John',
            lastname: 'Doe',
            email: 'admin@reva.staging.fr',
            password,
            roles: ['admin'],
            cohortes: [],
          })
        })
      }
    }).then(() => console.log("Staging users done"))
    .catch(e => console.log(e))
}

export default authRouter
