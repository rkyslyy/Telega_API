const Express = require('express')
const app = Express()
const usersRouter = require('./routes/users')
const authRouter = require('./routes/auth')
const imagesRouter = require('./routes/images')
const helmet = require('helmet')
const compression = require('compression')
var bodyParser = require('body-parser');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/images', imagesRouter)
app.use(helmet())
app.use(compression())

const port = process.env.PORT || 3000;
app.listen(port)

console.log(`Listening to port ${port}...`)
