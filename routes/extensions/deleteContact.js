module.exports =
async function deleteContacts(user, contact) {
    await deleteUsersFrom(user, contact._id)
    await deleteUsersFrom(contact, user._id)
    emitUpdateContacts(user._id, contact._id)
    emitUpdateContacts(contact._id, user._id)
}

async function deleteUsersFrom(user, contactID) {
    var newContacts = []
    user.contacts.forEach((contact) => {
        if (contact.id != contactID) newContacts.push(contact)
    })
    user.contacts = newContacts
    user.markModified('contacts')
    await user.save()
}

function emitUpdateContacts(firstID, secondID) {
    var clients = global.clients
    clients = clients.filter(client => {
        return client.userID == secondID
    })
    clients.forEach(client => {
        client.client.emit('update contacts', firstID, 'delete')
    })
}
