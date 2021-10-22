import { isAdminMiddleware } from '../auth'
import { getDiplomes } from './data'

const diplomeRouter = require('express').Router()

diplomeRouter.get(
  '/diplomes',
  isAdminMiddleware,
  async (_req: any, res: any) => {
    const diplomes = await getDiplomes()

    return res.json(diplomes)
  }
)

export default diplomeRouter
