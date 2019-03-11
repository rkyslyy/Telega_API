module.exports =
async function deleteContacts(user, contact, socketID) {
    await deleteUsersFrom(user, contact._id)
    await deleteUsersFrom(contact, user._id)
    emitDeleteContacts(user._id, contact._id, socketID)
    emitDeleteContacts(contact._id, user._id)
}

async function deleteUsersFrom(user, contactID) {
    var newContacts = []
    user.contacts.forEach((contact) => {
        if (contact.id != contactID) newContacts.push(contact)
    })
    user.contacts = newContacts
    user.messages = user.messages.filter(message => {
        return message.storeID != contactID
    })
    user.markModified('contacts')
    user.markModified('messages')
    await user.save()
}

function emitDeleteContacts(firstID, secondID, socketID) {
    var clients = global.clients
    clients = clients.filter(client => {
        return client.userID == firstID
    })
    clients.forEach(client => {
        if ((socketID && socketID != client.client.id) || !socketID) {
            client.client.emit('delete_contact', secondID)
        }
    })
}
