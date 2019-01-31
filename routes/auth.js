const Express = require('express')
const router = Express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.post('/', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email
    })
    if (!user) return res.status(404).send({
        error: 'User with such email not found'
    })
    if (!user.confirmed) return res.status(400).send({
        error: 'You need to confirm your email first'
    })
    if (user.password != req.body.password) return res.status(400).send({
        error: 'Wrong email or password'
    })
    res.send(jwt.sign({id: user._id, name: user.firstName}, 'secreto'))
})

module.exports = router
