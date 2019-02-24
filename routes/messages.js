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
    console.log(req.body)
    const socketID = req.body.socketID
    const myID = req.user.id
    const theirID = req.body.theirID
    const me = await User.findById(myID)
    const them = await User.findById(theirID)
    var datetime = new Date()
    const messageForMeObj = {
        message: req.body.messageForMe,
        time: datetime.toISOString(),
        mine: true,
        storeID: theirID
    }
    const messageForThemObj = {
        message: req.body.messageForThem,
        time: datetime.toISOString(),
        mine: false,
        storeID: myID
    }
    updateUsers(me, them, messageForMeObj, messageForThemObj)
    await me.save()
    await them.save()
    emitUpdateMessages(theirID, messageForThemObj)
    emitUpdateMessages(myID, messageForMeObj, socketID)
    res.send({
        message: 'Message sent!',
        time: new Date().toISOString()
    })
})

function updateUsers(sender, addresse, mesForSender, mesForAddr) {
    sender.messages.push(mesForSender)
    addresse.messages.push(mesForAddr)
    sender.markModified('messages')
    addresse.markModified('messages')
    var contacts = addresse.contacts
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i]
        if (contact.id == sender._id)
            contacts[i].unread = true
    }
    addresse.contacts = contacts
    addresse.markModified('contacts')
}

function emitUpdateMessages(id, message, socketID) {
    var clients = global.clients.filter(client => {
        return client.userID == id
    })
    clients.forEach(client => {
        if ((socketID && socketID != client.client.id) || !socketID) {
            // console.log('emitting')
            // console.log('ID SENT TO SERVER:', socketID)
            // console.log('CLIENT ID:', client.client.id)
            // console.log('')
            client.client.emit('update messages', message)
        }
    })
}

module.exports = router
