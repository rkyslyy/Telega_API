const database = require('../database')

const userSchema = database.Schema({
    email: String,
    password: String,
    username: String,
    avatar: String,
    contacts: [String],
    publicPem: String,
    privatePem: String,
    confirmed: Boolean,
    confHash: String,
    data: Buffer
})

const User = database.model('User', userSchema)

module.exports = User
