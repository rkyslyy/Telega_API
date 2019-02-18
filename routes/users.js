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
    const clients = global.clients
    for (let index = 0; index < user.contacts.length; index++) {
        const contact = await User.findById(user.contacts[index].id)
        var toPush = _.pick(contact, ['_id', 'email', 'username', 'avatar', 'publicPem'])
        var online = false
        for (let i = 0; i < clients.length; i++) {
            const client = clients[i];
            if (client.userID == contact._id)
                online = true
        }
        toPush.online = online
        toPush.confirmed = user.contacts[index].confirmed
        toPush.requestIsMine = user.contacts[index].requestIsMine
        toPush.unread = user.contacts[index].unread
        contacts.push(toPush)
    }
    res.send({
        user: {
            id: id,
            email: user.email,
            username: user.username,
            avatar: user.avatar,
            contacts: contacts,
            messages: user.messages,
            publicPem: user.publicPem,
            privatePem: user.privatePem,
        }
    })
})

router.get('/', async (req, res) => {
    // const users = await User.find()
    var clients = global.clients
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
    res.send(_.pick(user, ['_id', 'email', 'username', 'avatar', 'publicPem']))
})

router.post('/accept_friend', auth, async (req, res) => {
    const id = req.user.id
    const friendID = req.body.friendID
    const user = await User.findById(id)
    const friend = await User.findById(friendID)
    const acceptFriendOf = require('./extensions/acceptFriend')
    await acceptFriendOf(user, friend)
    res.send({
        message: 'Friend request accepted!'
    })
})

router.put('/add_contact', auth, async (req, res) => {
    const id = req.user.id
    const newContactID = req.body.contact
    const user = await User.findById(id)
    const contact = await User.findById(newContactID)
    const addContactTo = require('./extensions/addContact')
    await addContactTo(user, contact)
    res.send({
        message: 'Contact added!',
        user: _.pick(user, ['email', 'contacts'])
    })
})

router.put('/delete_contact', auth, async (req, res) => {
    const id = req.user.id
    const contactID = req.body.contact
    const user = await User.findById(id)
    const contact = await User.findById(contactID)
    const deleteContactFrom = require('./extensions/deleteContact')
    deleteContactFrom(user, contact)
    res.send({
        message: 'Contact deleted!',
        user: _.pick(user, ['email', 'contacts'])
    })
})

router.get('/delete_all_contacts', async (req, res) => {
    const users = await User.find()
    for (let i = 0; i < users.length; i++) {
        const user = users[i]
        user.contacts = []
        await user.save()
    }
    res.send('All contacts erased!')
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

router.put('/change_password/', auth, async (req, res) => {
    const user = await User.findById(req.user.id)
    console.log('USER FOUND')
    if (!user) return res.status(404).send({
        error: 'Could not find user'
    })
    const password = req.body.password
    const pem = req.body.pem
    const salt = bcrypt.genSaltSync(10)
    const hashedPass = bcrypt.hashSync(password, salt)
    user.password = hashedPass
    user.privatePem = pem
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
        to: email,
        subject: "Please confirm your email",
        text: `https://telega-rkyslyy.herokuapp.com/users/confirm?email=${email}&hash=${hash}`,
      };
      await transporter.sendMail(mailOptions)
}

module.exports = router
