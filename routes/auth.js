const Express = require('express')
const router = Express.Router()
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.post('/', async (req, res) => {
    const user = await User.findOne({
        email: req.body.email
    })
    if (!user) return res.status(404).send('User with such email not found')
    const passwordMatches = await bcrypt.compare(req.body.password, user.password)
    if (!passwordMatches) return res.status(400).send('Password incorrect')
    res.send(jwt.sign({id: user._id, name: user.firstName}, 'secreto'))
})

module.exports = router
