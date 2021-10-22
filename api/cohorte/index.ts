import { isAdminMiddleware } from '../auth'
import { getCohortes } from './data'

const cohorteRouter = require('express').Router()

cohorteRouter.get(
  '/cohortes',
  isAdminMiddleware,
  async (_req: any, res: any) => {
    const cohortes = await getCohortes()

    return res.json(cohortes)
  }
)

export default cohorteRouter
