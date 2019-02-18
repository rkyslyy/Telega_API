const Express = require('express')
const router = Express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')

router.get('/erase', async (req, res) => {
    const users = await User.find()
    for (let index = 0; index < users.length; index++) {
        const user = users[index]
        user.messages = []
        user.markModified('messages')
        await user.save()
    }
    res.send('Messages erased!')
})

router.post('/', auth, async (req, res) => {
    const socketID = req.body.socketID
    const myID = req.user.id
    const messageForMe = req.body.messageForMe
    const theirID = req.body.theirID
    const messageForThem = req.body.messageForThem
    const me = await User.findById(myID)
    const them = await User.findById(theirID)
    var datetime = new Date();
    // datetime.setDate(datetime.getDate() - 1)
    // console.log(datetime.toISOString())
    const messageForMeObj = {
        message: messageForMe,
        time: datetime.toISOString(),
        mine: true,
        storeID: theirID
    }
    const messageForThemObj = {
        message: messageForThem,
        time: datetime.toISOString(),
        mine: false,
        storeID: myID
    }
    me.messages.push(messageForMeObj)
    them.messages.push(messageForThemObj)
    me.markModified('messages')
    them.markModified('messages')
    var contacts = them.contacts
    // console.log(contacts)
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i]
        if (contact.id == myID)
            contacts[i].unread = true
    }
    them.contacts = contacts
    them.markModified('contacts')
    await me.save()
    await them.save()

    var clients = global.clients.filter(client => {
        return client.userID == theirID
    })
    clients.forEach(client => {
        console.log('EMMITTING')
        client.client.emit('update messages', messageForThemObj)
    })

    clients = global.clients.filter(client => {
        return client.userID == myID
    })
    console.log(clients)
    clients.forEach(client => {
        if (client.client.id != socketID) {
            console.log('EMMITTING TO MYSELF')
            client.client.emit('update messages', messageForMeObj)
        }
    })

    res.send({
        message: 'Message sent!',
        time: new Date().toISOString()
    })
})

module.exports = router
