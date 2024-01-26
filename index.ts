import http from 'http'
import app from './app/app'
import 'dotenv/config'

const port = process.env.PORT ?? 8080

const server = http.createServer(app)
server.listen(port, () => {
    console.log(`server is listening to ${port} port`)
})
