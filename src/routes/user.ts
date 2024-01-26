import {Router} from "express";
import * as controller from '../controllers/user'

const router = Router();

router.post("/registration", controller.registration)
router.post("/login", controller.login)

export default router
