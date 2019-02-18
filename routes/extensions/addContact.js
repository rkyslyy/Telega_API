module.exports =
async function addContactTo(user, contact) {
    await pushContactTo(user, contact, true)
    await pushContactTo(contact, user, false)
    emitUpdateContacts(user._id)
    emitUpdateContacts(contact._id)
}

async function pushContactTo(user, contact, state) {
    const newContact = {
        id: contact._id.toString(),
        confirmed: false,
        requestIsMine: state,
        unread: false
    }
    user.contacts[user.contacts.length] = newContact
    user.markModified('contacts')
    await user.save()
}

function emitUpdateContacts(id) {
    var clients = global.clients
    clients = clients.filter(client => {
        return client.userID == id
    })
    clients.forEach(client => {
        client.client.emit('update contacts')
    })
}
