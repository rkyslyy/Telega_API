const Express = require('express')
const router = Express.Router()
const User = require('../models/user')
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const _ = require('lodash')

router.get('/me', auth, async (req, res) => {
    const id = req.user.id
    const user = await User.findById(id)
    if (!user) return res.status(404).send({
        error: 'User not found'
    })
    var contacts = []
    for (let index = 0; index < user.contacts.length; index++) {
        const contact = await User.findById(user.contacts[index].id)
        var toPush = _.pick(contact, ['_id', 'email', 'username', 'avatar'])
        toPush.confirmed = user.contacts[index].confirmed
        toPush.requestIsMine = user.contacts[index].requestIsMine
        contacts.push(toPush)
    }
    res.send({
        user: {
            id: id,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            contacts: contacts,
            publicPem: user.publicPem,
            privatePem: user.privatePem,
        }
    })
})

router.get('/', async (req, res) => {
    // const users = await User.find()
    var clients = global.clients
    console.log(clients.length)
    res.send({
        users: 'users'
    })
})

router.get('/search/', async (req, res) => {
    const email = req.query.email
    const id = req.query.id
    const user = email  ? await User.findOne({
        email: email
    })                  : await User.findById(id)
    if (!user) return res.status(404).send({
        error: 'No user with such email found'
    })
    res.send(_.pick(user, ['_id', 'email', 'username', 'avatar']))
})

router.post('/accept_friend', auth, async (req, res) => {
    const id = req.user.id
    const friendID = req.body.friendID
    const user = await User.findById(id)
    var userContacts = user.contacts
    for (let index = 0; index < userContacts.length; index++) {
        const contact = userContacts[index];
        if (contact.id == friendID) {
            if (userContacts[index].confirmed) {
                return res.send({
                    message: 'Friend request accepted!'
                })
            }
            userContacts[index].confirmed = true
        }
            
    }
    user.contacts = userContacts
    user.markModified('contacts')
    await user.save()

    const friend = await User.findById(friendID)
    var friendContacts = friend.contacts
    for (let index = 0; index < friendContacts.length; index++) {
        const contact = friendContacts[index];
        if (contact.id == id)
            friendContacts[index].confirmed = true
    }
    friend.contacts = friendContacts
    friend.markModified('contacts')
    await friend.save()

    var clients = global.clients
    clients = clients.filter(client => {
        return client.userID == friendID
    })
    clients.forEach(client => {
        console.log('EMMITTING')
        client.client.emit('update contacts', id)
    })

    clients = global.clients
    clients = clients.filter(client => {
        return client.userID == id
    })
    clients.forEach(client => {
        console.log('EMMITTING')
        client.client.emit('update contacts', friendID)
    })

    res.send({
        message: 'Friend request accepted!'
    })
})

router.put('/add_contact', auth, async (req, res) => {
    const id = req.user.id
    if (!id) return res.status(400).send({
        error: 'No id provided in token'
    })
    const user = await User.findById(id)
    const userContacts = user.contacts
    const newContact = req.body.contact
    userContacts[userContacts.length] = {
        id: newContact,
        confirmed: false,
        requestIsMine: true
    }
    user.contacts = userContacts
    user.markModified('contacts')
    await user.save()

    const contragent = await User.findById(newContact)
    const contrContacts = contragent.contacts
    contrContacts[contrContacts.length] = {
        id: id,
        confirmed: false,
        requestIsMine: false
    }
    contragent.markModified('contacts')
    await contragent.save()

    var clients = global.clients
    clients = clients.filter(client => {
        return client.userID == newContact
    })
    clients.forEach(client => {
        console.log('EMMITTING')
        client.client.emit('update contacts')
    })

    clients = global.clients
    clients = clients.filter(client => {
        return client.userID == id
    })
    clients.forEach(client => {
        console.log('EMMITTING')
        client.client.emit('update contacts')
    })

    res.send({
        message: 'Contact added!',
        user: _.pick(user, ['email', 'contacts'])
    })
})

router.put('/delete_contact', auth, async (req, res) => {
    const id = req.user.id
    if (!id) return res.status(400).send({
        error: 'No id provided in token'
    })
    const user = await User.findById(id)
    var newContacts = []
    const targetContact = req.body.contact
    user.contacts.forEach((contact) => {
        if (contact.id != targetContact) newContacts.push(contact)
    })
    user.contacts = newContacts
    user.markModified('contacts')
    await user.save()

    const contragent = await User.findById(targetContact)
    newContacts = []
    contragent.contacts.forEach((contact) => {
        if (contact.id != id) newContacts.push(contact)
    })
    contragent.contacts = newContacts
    contragent.markModified('contacts')
    await contragent.save()

    var clients = global.clients
    clients = clients.filter(client => {
        return client.userID == targetContact
    })
    clients.forEach(client => {
        console.log('EMMITTING')
        client.client.emit('update contacts', id, 'delete')
    })

    clients = global.clients
    clients = clients.filter(client => {
        return client.userID == id
    })
    clients.forEach(client => {
        console.log('EMMITTING')
        client.client.emit('update contacts', targetContact, 'delete')
    })

    res.send({
        message: 'Contact deleted!',
        user: _.pick(user, ['email', 'contacts'])
    })
})

router.put('/', auth, async (req, res) => {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).send({
        error: 'Could not find user'
    })
    const username = req.body.username
    const avatar = req.body.avatar
    user.username = username
    user.avatar = avatar
    await user.save()
    res.send({
        success: true
    })
})

router.get('/confirm', async (req, res) => {
    const email = req.query.email
    const hash = req.query.hash
    const user = await User.findOne({
        email: email
    })
    if (user.confHash != hash) return res.status(400).send({
        error: 'Could not confirm user'
    })
    if (user.confirmed) return res.status(400).send({
        error: 'User already confirmed'
    })
    user.confirmed = true
    await user.save()
    res.send('User confirmed! You may now log in.')
})

router.post('/', async (req, res) => {
    if (await User.findOne({ email: req.body.email })) return res.status(500).json({
        error: 'Email already registered'
    })
    const crypto = require("crypto");
    const confirmationHash = crypto.randomBytes(20).toString('hex');
    const salt = bcrypt.genSaltSync(10)
    const hashedPass = bcrypt.hashSync(req.body.password, salt)
    const newUser = User({
        email: req.body.email,
        password: hashedPass,
        username: req.body.username,
        avatar: req.body.avatar,
        privatePem: req.body.privatePem,
        publicPem: req.body.publicPem,
        confirmed: false,
        confHash: confirmationHash,
        data: req.body.data
    })
    await newUser.save()
    await sendConfirmationEmail(req.body.email, confirmationHash)
    res.send({
        message: 'Confirm your email'
    })
})

async function sendConfirmationEmail(email, hash) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'telega.app@gmail.com',
          pass: 'rkyslyyTelega'
        }
      });
    
      let mailOptions = {
        from: '"Telega" <telega.app@gmail.com>', 
        to: 'telega.app95@gmail.com',
        subject: "Please confirm your email",
        text: `https://telega-rkyslyy.herokuapp.com/users/confirm?email=${email}&hash=${hash}`,
      };
      await transporter.sendMail(mailOptions)
}

module.exports = router
