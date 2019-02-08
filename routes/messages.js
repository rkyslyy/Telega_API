const Express = require('express')
const router = Express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')

router.post('/', auth, async (req, res) => {
    const myID = req.user.id
    const messageForMe = req.body.messageForMe
    const theirID = req.body.theirID
    const messageForThem = req.body.messageForThem
    const me = await User.findById(myID)
    const them = await User.findById(theirID)
    const messageForMeObj = {
        message: messageForMe,
        mine: true,
        storeID: theirID
    }
    const messageForThemObj = {
        message: messageForThem,
        mine: false,
        storeID: myID
    }
    me.messages.push(messageForMeObj)
    them.messages.push(messageForThemObj)
    me.markModified('messages')
    them.markModified('messages')
    await me.save()
    await them.save()

    var clients = global.clients
    clients = clients.filter(client => {
        return client.userID == theirID
    })
    clients.forEach(client => {
        console.log('EMMITTING')
        client.client.emit('update messages', myID)
    })

    res.send({
        message: 'Message sent!'
    })
})

module.exports = router
