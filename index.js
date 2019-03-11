const http = require('http')
const app = require('express')()
const usersRouter = require('./routes/users')
const authRouter = require('./routes/auth')
const messagesRouter = require('./routes/messages')
const helmet = require('helmet')
const compression = require('compression')
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000

app.use(bodyParser.json({limit: '50mb'}))
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}))
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/messages', messagesRouter)
app.use(helmet())
app.use(compression())

app.server = http.createServer(app)
const setupSocket = require('./socket')
setupSocket(app)
app.server.listen(port)
console.log(`Listening to port ${port}...`)
module.exports.clients = clients
