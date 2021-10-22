import { getUserByEmail, getUsers, saveUser } from './data'
import { generateToken } from './jwt'

const argon2 = require('argon2')
const authRouter = require('express').Router()
const yup = require('yup')

const isAdminMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.substring('Bearer '.length)
  if (!token || token !== process.env.ADMIN_TOKEN) {
    return res.status(403).send()
  }

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
        // console.log(e)
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
    res.status(500).send('Bad format, required fields are: email, password')
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

export default authRouter
