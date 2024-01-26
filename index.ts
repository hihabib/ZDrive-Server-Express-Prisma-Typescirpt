import http from 'http'
import app from './src/app/app'
import * as dotenv from 'dotenv'

dotenv.config();

const port = process.env.PORT ?? 8080

const server = http.createServer(app)
server.listen(port, () => {
    console.log(`server is listening to ${port} port`)
})
