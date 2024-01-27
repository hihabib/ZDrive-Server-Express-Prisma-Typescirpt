import express, {NextFunction, Request, Response} from 'express'
import cors from 'cors'
import router from "../routes";

const app = express()
app.use(express.json())
app.use(cors())
app.use(router)

//error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err)
    res.status(500).send('Something broke!')
})

export default app
