import { jwtMiddleware } from '../auth/jwt'
import { getCandidates } from './data'

const candidateRouter = require('express').Router()

candidateRouter.get(
  '/candidates',
  jwtMiddleware,
  async (req: any, res: any) => {
    const users = await getCandidates(req.user.roles)

    if (!users.length) {
      return res.status(404).send()
    }

    res.json(users)
  }
)

export default candidateRouter
