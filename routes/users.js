const Express = require('express')
const router = Express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')

router.get('/', async (req, res) => {
    const users = await User.find()
    res.send(users)
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
    var crypto = require("crypto");
    var confirmationHash = crypto.randomBytes(20).toString('hex');
    const newUser = User({
        email: req.body.email,
        password: req.body.password,
        username: req.body.username,
        avatar: req.body.avatar,
        privatePem: req.body.privatePem,
        publicPem: req.body.publicPem,
        confirmed: false,
        confHash: confirmationHash
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
        secure: true, // true for 465, false for other ports
        auth: {
          user: 'romcheg95@gmail.com', // generated ethereal user
          pass: 'Bloodypastor1986' // generated ethereal password
        }
      });
    
      let mailOptions = {
        from: '"Telega" <romcheg95@gmail.com>', // sender address
        to: 'romcheg95@gmail.com', // list of receivers
        subject: "Please confirm your email", // Subject line
        text: `https://telega-rkyslyy.herokuapp.com/users/confirm?email=${email}&hash=${hash}`, // plain text body
        //text: `localhost:3000/users/confirm?email=${email}&hash=${hash}`, // plain text body
      };
      await transporter.sendMail(mailOptions)
}

module.exports = router
