import {Router} from 'express'
import user from './user'

const router = Router()
router.use('/api/v1/user', user)

export default router
