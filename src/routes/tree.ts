import {Router} from "express";
import * as controller from '../controllers/tree'
import {authenticate} from "../middlewares/authenticate";

const router = Router();

router.get("/getItems/*", authenticate, controller.getItems)
router.get("/getItems", authenticate, controller.getItems)

export default router
