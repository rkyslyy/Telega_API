const Express = require('express')
const router = Express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')

router.get('/', async (req, res) => {
    const users = await User.find()
    res.send(users)
})

router.post('/', async (req, res) => {
    const bcrypt = require('bcryptjs')
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    const newUser = User({
        email: req.body.email,
        password: hashedPassword,
        username: req.body.username,
        avatar: req.body.avatar,
        privatePem: req.body.privatePem,
        publicPem: req.body.publicPem,
        confirmed: false
    })
    await newUser.save()
    await sendConfirmationEmail()
    res.send('Confirm your email')
    // res.send( {
    //     token: jwt.sign({
    //         id: newUser._id
    //     }, 'secreto')
    // })
})

async function sendConfirmationEmail() {
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
        to: "romcheg95@gmail.com", // list of receivers
        subject: "Please confirm your email", // Subject line
        text: "Hello world?", // plain text body
      };
      await transporter.sendMail(mailOptions)
      res.send('Email sent')
}

module.exports = router
