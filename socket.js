const socket = require('socket.io')
const User = require('./models/user')

module.exports =
function setupSocket(app) {
    global.clients = []
    const io = socket(app.server)
    io.on('connection', async (socket) => {
        socket.on('introduce', async function(username, id, numberOfMessages) {
            global.clients.push({
                client: socket,
                username: username,
                userID: id
            })
            const user = await User.findById(id)
            if (user.messages.length != numberOfMessages) {
                socket.emit('just_reload', user.messages)
            }
            const userContactsClients = await getUserContactsClients(id)
            for (let index = 0; index < userContactsClients.length; index++) {
                const element = userContactsClients[index];
                element.client.emit('online_changed', id, true)
                socket.emit('online', element.userID)
            }
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
            if (iAmUnique(myID)) {
                const userContactsClients = await getUserContactsClients(myID)
                for (let index = 0; index < userContactsClients.length; index++) {
                    const element = userContactsClients[index];
                    element.client.emit('online_changed', myID, false)
                }
            }
        })
        socket.on('messages_read', async (contactID, myID) => {
            setMessagesReadFrom(contactID, myID)
            const myClones = global.clients.filter(client => {
                return client.userID == myID
            })
            myClones.forEach(client => {
                client.client.emit('messages_read', contactID)
            })
        })
        socket.on('settings_changed', async (id, username, avatar) => {
            const userContactsClients = await getUserContactsClients(id)
            for (let index = 0; index < userContactsClients.length; index++) {
                const element = userContactsClients[index]
                element.client.emit('settings_changed', id, username, avatar)
            }
        })
        socket.emit('introduce') 
    })
}

function iAmUnique(myID) {
    const clients = global.clients
    for (let index = 0; index < clients.length; index++) {
        const element = clients[index];
        if (element.userID == myID)
            return false
    }
    return true
}

async function setMessagesReadFrom(contactID, myID) {
    const user = await User.findById(myID)
    var contacts = user.contacts
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i]
        if (contact.id == contactID) {
            contacts[i].unread = false
        }
    }
    user.contacts = contacts
    user.markModified('contacts')
    await user.save()
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
