const mongoose = require('mongoose')

mongoose.connect('mongodb://admin:sapkovski1986@ds111765.mlab.com:11765/telega-rkyslyy-db', { useNewUrlParser: true })
                .then(() => console.log('Connected to database...'))
                .catch(error => console.log(error))

module.exports = mongoose

// mongodb://admin:sapkovski1986@ds111765.mlab.com:11765/telega-rkyslyy-db
