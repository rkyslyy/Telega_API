const Express = require('express')
const app = Express()
const usersRouter = require('./routes/users')
const authRouter = require('./routes/auth')
const helmet = require('helmet')
const compression = require('compression')
const nodemailer = require('nodemailer')

app.use(Express.json())
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use(helmet())
app.use(compression())

const port = process.env.PORT || 3000;
app.listen(port)

console.log(`Listening to port ${port}...`)
