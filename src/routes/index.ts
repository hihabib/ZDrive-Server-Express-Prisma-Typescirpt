import {Router} from 'express'
import user from './user'
import tree from './tree'

const router = Router()
router.use('/api/v1/user', user)
router.use('/api/v1/tree', tree)

export default router
