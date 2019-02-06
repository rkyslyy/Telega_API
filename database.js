const mongoose = require('mongoose')
const username = process.env.rkyslyy_db_username || 'admin'
const password = process.env.rkyslyy_db_password || 'sapkovski1986'

mongoose.connect(`mongodb://${username}:${password}@ds111765.mlab.com:11765/telega-rkyslyy-db`, { useNewUrlParser: true })
                .then(() => console.log('Connected to database...'))
                .catch(error => console.log(error))

module.exports = mongoose
