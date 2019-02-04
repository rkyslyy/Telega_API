const mongoose = require('mongoose')
const username = process.env.rkyslyy_db_username
const password = process.env.rkyslyy_db_password

mongoose.connect(`mongodb://${username}:${password}@ds111765.mlab.com:11765/telega-rkyslyy-db`, { useNewUrlParser: true })
                .then(() => console.log('Connected to database...'))
                .catch(error => console.log(error))

module.exports = mongoose
