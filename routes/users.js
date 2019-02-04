const Express = require('express')
const router = Express.Router()
const User = require('../models/user')
const nodemailer = require('nodemailer')
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')

router.get('/me', auth, async (req, res) => {
    const id = req.user.id
    const user = await User.findById(id)
    if (!user) return res.status(404).send({
        error: 'User not found'
    })
    res.send({
        user: user
    })
})

router.get('/', async (req, res) => {
    const users = await User.find()
    res.send(users)
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
