module.exports =
async function acceptFriendOf(user, friend, socketID) {
    await confirmBy(user, friend)
    await confirmBy(friend, user)
    emitAcceptFriend(user._id, friend._id, socketID)
    emitAcceptFriend(friend._id, user._id)
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

function emitAcceptFriend(userID, friendID, socketID) {
    var clients = global.clients
    clients = clients.filter(client => {
        return client.userID == userID
    })
    const online = friendIsOnline(global.clients, friendID)
    clients.forEach(client => {
        if ((socketID && socketID != client.client.id) || !socketID) {
            client.client.emit('accept_friend', friendID, online)
        }
    })
}

function friendIsOnline(clients, friendID) {
    for (let i = 0; i < clients.length; i++) {
        const client = clients[i]
        if (client.userID == friendID)
            return true
    }
    return false
}
