const database = require('../database')

const userSchema = database.Schema({
    email: String,
    password: String,
    username: String,
    avatar: String,
    publicPem: String,
    privatePem: String
})

const User = database.model('User', userSchema)

module.exports = User
