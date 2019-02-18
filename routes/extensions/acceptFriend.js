module.exports =
async function acceptFriendOf(user, friend) {
    await confirmBy(user, friend)
    await confirmBy(friend, user)
    emitUpdateContacts(user._id, friend._id)
    emitUpdateContacts(friend._id, user._id)
}

async function confirmBy(user, friend) {
    for (let index = 0; index < user.contacts.length; index++) {
        const contact = user.contacts[index]
        if (contact.id == friend._id) {
            user.contacts[index].confirmed = true
        }
    }
    user.markModified('contacts')
    await user.save()
}

function emitUpdateContacts(userID, friendID) {
    var clients = global.clients
    clients = clients.filter(client => {
        return client.userID == friendID
    })
    clients.forEach(client => {
        client.client.emit('update contacts', userID)
    })
}
