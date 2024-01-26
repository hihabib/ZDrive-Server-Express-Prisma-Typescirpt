import {Router} from 'express'
import items from './items'

const router = Router()
router.use('/api/v1/items', items)

export default router
