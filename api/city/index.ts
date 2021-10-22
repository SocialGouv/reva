import { isAdminMiddleware } from '../auth'
import { getCities } from './data'

const cityRouter = require('express').Router()

cityRouter.get('/cities', isAdminMiddleware, async (_req: any, res: any) => {
  const cities = await getCities()
  return res.json(cities)
})

export default cityRouter
