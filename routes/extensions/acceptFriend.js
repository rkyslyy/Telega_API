module.exports =
async function acceptFriendOf(user, friend) {
    await confirmByUser(user, friend)
    await confirmByFriend(user, friend)
    emitUpdateContacts(user._id, friend._id)
    emitUpdateContacts(friend._id, user._id)
}

async function confirmByUser(user, friend) {
    for (let index = 0; index < user.contacts.length; index++) {
        const contact = user.contacts[index]
        if (contact.id == friend._id) {
            user.contacts[index].confirmed = true
        }
    }
    user.markModified('contacts')
    await user.save()
}

async function confirmByFriend(user, friend) {
    for (let index = 0; index < friend.contacts.length; index++) {
        const contact = friend.contacts[index];
        if (contact.id == user._id)
            friend.contacts[index].confirmed = true
    }
    friend.markModified('contacts')
    await friend.save()
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
