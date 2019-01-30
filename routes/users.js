const Express = require('express')
const router = Express.Router()
const User = require('../models/user')
const aes256 = require('aes256')
const crypto = require('crypto')

router.get('/', async (req, res) => {
    const user = await User.find()
    res.send(user)
})

router.post('/', async (req, res) => {
    const bcrypt = require('bcryptjs')
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)
    const keys = getKeys()
    const cipher = crypto.createCipheriv('aes-128-cbc', 'drowssapdrowssap', 'drowssapdrowssap')
    var encryptedPrivatePem = keys.privatePem
    encryptedPrivatePem = cipher.update(encryptedPrivatePem, 'utf8', 'base64')
    const newUser = User({
        email: req.body.email,
        password: hashedPassword,
        firstName: req.body.firstName,
        secondName: req.body.secondName,
        avatar: req.body.avatar,
        privatePem: encryptedPrivatePem,
        publicPem: keys.publicPem
    })
    res.send(await newUser.save())
})

function getKeys() {
    const ursa = require('ursa');
    const fs = require('fs')
    const keys = ursa.generatePrivateKey();
    const privPem = keys.toPrivatePem();
    console.log(privPem.toString('utf8'))
    fs.writeFileSync('./private.pem', privPem)
    const pubPem = ursa.createPrivateKey(privPem, '').toPublicPem()
    const publicKey = ursa.createPublicKey(pubPem)
    // console.log(publicKey.encrypt('Hello my boiii', 'utf8', 'base64'))
    return {
        privatePem: privPem.toString('utf8'),
        publicPem: pubPem.toString('utf8')
    }
}

module.exports = router
