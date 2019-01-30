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
        publicPem: req.body.publicPem
    })
    await newUser.save()
    res.send( {
        token: jwt.sign({
            id: newUser._id
        }, 'secreto')
    })
})

module.exports = router
