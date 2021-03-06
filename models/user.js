const database = require('../database')

const userSchema = database.Schema({
    email: String,
    password: String,
    username: String,
    avatar: String,
    contacts: [Object],
    messages: [Object],
    publicPem: String,
    privatePem: String,
    confirmed: Boolean,
    confHash: String
})

const User = database.model('User', userSchema)

module.exports = User
