import {Router} from 'express'
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()
const router = Router()

router.post('/add', (req, res) => {
    (async () => {
        const {
            type,
            name
        } = req.body;
        const item = await prisma.item.create({
            data: {
                type,
                name
            }
        })
        res.status(201).json(item)
    })()
});

router.get("/get", (req, res) => {
    (async () => {
        const data = await prisma.item.findMany()
        res.json(data)
    })()
});
export default router
