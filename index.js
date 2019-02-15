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
    socket.on('introduce', async function(username, id) {
        global.clients.push({
            client: socket,
            username: username,
            userID: id
        })
        console.log(`\n${username} CONNECTED`)
        const userContactsClients = await getUserContactsClients(id)
        console.log('friends:', userContactsClients.length)
        for (let index = 0; index < userContactsClients.length; index++) {
            const element = userContactsClients[index];
            element.client.emit('online', id)
            console.log(`EMITTING TO ${element.username} THAT I AM ONLINE`)
            socket.emit('online', element.userID)
        }
        // console.log(global.clients.length, 'Clients connected:')
        // global.clients.forEach(client => {
        //     console.log(client.username + ' ' + client.userID + ' with socket ' + client.client.id)
        // })
        console.log('')
    })
    socket.on('disconnect', async () => {
        var myID
        var username
        global.clients = clients.filter(value => {
            if (value.client.id == socket.id) {
                myID = value.userID
                username = value.username
            }
            return value.client.id != socket.id
        })
        console.log(`\n${username} DISCONNECTED`)
        if (iAmUnique(myID)) {
            const userContactsClients = await getUserContactsClients(myID)
            console.log('friends:', userContactsClients.length)
            for (let index = 0; index < userContactsClients.length; index++) {
                const element = userContactsClients[index];
                element.client.emit('offline', myID)
                console.log(`EMITTING TO ${element.username} THAT I AM OFFLINE`)
            }
        }
        // console.log('Clients connected:')
        // global.clients.forEach(client => {
        //     console.log(client.username + ' ' + client.userID + ' with socket ' + client.client.id)
        // })
    })
    socket.emit('introduce') 
})

function iAmUnique(myID) {
    const clients = global.clients
    for (let index = 0; index < clients.length; index++) {
        const element = clients[index];
        if (element.userID == myID)
            return false
    }
    return true
}

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
            if (id == client.userID)
                contactsClients.push(client)
        })
    })
    return contactsClients
}


app.server.listen(port)
console.log(`Listening to port ${port}...`)

module.exports.clients = clients
