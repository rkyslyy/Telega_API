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
    clients.forEach(client => {
        if ((socketID && socketID != client.client.id) || !socketID) {
            // console.log(`EMITTING ACCEPT TO ${client.username}`)
            client.client.emit('accept_friend', friendID)
        }
    })
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
