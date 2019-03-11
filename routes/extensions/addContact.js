module.exports =
async function addContactTo(user, contact, socketID) {
    await pushContactTo(user, contact, true)
    await pushContactTo(contact, user, false)
    emitAddContact(user._id, socketID)
    emitAddContact(contact._id)
}

async function pushContactTo(user, contact, state) {
    const newContact = {
        id: contact._id.toString(),
        confirmed: false,
        requestIsMine: state,
        unread: false
    }
    user.contacts.unshift(newContact)
    user.markModified('contacts')
    await user.save()
}

function emitAddContact(id, socketID) {
    var clients = global.clients
    clients = clients.filter(client => {
        return client.userID == id
    })
    clients.forEach(client => {
        if ((socketID && socketID != client.client.id) || !socketID) {
            client.client.emit('add_contact', id)
        }
    })
}

function emitUpdateContacts(id, socketID) {
    var clients = global.clients
    clients = clients.filter(client => {
        return client.userID == id
    })
    clients.forEach(client => {
        if ((socketID && socketID != client.client.id) || !socketID) {
            client.client.emit('update contacts', id)
        }
    })
}
