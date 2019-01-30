const Express = require('express')
const app = Express()
const usersRouter = require('./routes/users')
const authRouter = require('./routes/auth')
const helmet = require('helmet')
const compression = require('compression')
const bcrypt = require('bcryptjs')

app.use(Express.json())
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use(helmet())
app.use(compression())

const port = process.env.PORT || 3000;
app.listen(port)

console.log(`Listening to port ${port}...`)


// async function gen() {
//     const salt = await bcrypt.genSalt(10)
//     console.log(salt)
//     const hash = await bcrypt.hash('roman the encrypter', salt)
//     console.log(hash)
// }

// gen()

// const ursa = require('ursa');
// const fs = require('fs')

// const keys = ursa.generatePrivateKey();
// var privPem = keys.toPrivatePem('base64');
// console.log(privPem)
// var privateKey = ursa.createPrivateKey(privPem, '', 'base64')
// var pubPem = privateKey.toPublicPem('base64')
// var publicKey = ursa.createPublicKey(pubPem, 'base64')
// // console.log(publicKey)
// const enc = publicKey.encrypt('Hello my boi', 'utf8', 'base64')
// console.log(enc)
// const dec = privateKey.decrypt(enc, 'base64', 'utf8')
// console.log(dec)

