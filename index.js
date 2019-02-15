const Express = require('express')
const http = require('http')
const app = Express()
const usersRouter = require('./routes/users')
const authRouter = require('./routes/auth')
const imagesRouter = require('./routes/images')
const messagesRouter = require('./routes/messages')
const helmet = require('helmet')
const compression = require('compression')
var bodyParser = require('body-parser');
const User = require('./models/user')

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/images', imagesRouter)
app.use('/messages', messagesRouter)
app.use(helmet())
app.use(compression())

app.server = http.createServer(app)

const port = process.env.PORT || 3000;

const socket = require('socket.io')

let io = socket(app.server);

global.clients = []

io.on('connection', async (socket) => {
    console.log('\nCONNECTION')
    socket.on('introduce', async function(username, id) {
        global.clients.push({
            client: socket,
            username: username,
            userID: id
        })
        // const userContactsClients = await getUserContactsClients(id)
        // console.log(userContactsClients)
        // userContactsClients.forEach(client => {
        //     client.emit('online', userID)
        //     console.log('EMITTING ONLINE')
        // })
        console.log(global.clients.length, 'Clients connected:')
        global.clients.forEach(client => {
            console.log(client.username + ' ' + client.userID + ' with socket ' + client.client.id)
        })
        console.log('')
    }) 
    socket.on('disconnect', () => {
        console.log('\nDISCONNECTION')
        global.clients = clients.filter(value => {
            return value.client.id != socket.id
        })
        console.log('Clients connected:')
        global.clients.forEach(client => {
            console.log(client.username + ' ' + client.userID + ' with socket ' + client.client.id)
        })
    })
    socket.emit('introduce') 
})

async function getUserContactsClients(id) {
    const user = await User.findById(id)
    const userContacts = user.contacts
    var ids = []
    userContacts.forEach(contact => {
        ids.push(contact.id)
    })
    const clients = global.clients
    var contactsClients = []
    clients.forEach(client => {
        ids.forEach(id => {
            console.log('id:', id)
            console.log('client id:', client.userID)
            if (id == client.userID)
                contactsClients.push(client)
        })
    })
    return contactsClients
}


app.server.listen(port)
console.log(`Listening to port ${port}...`)

module.exports.clients = clients
