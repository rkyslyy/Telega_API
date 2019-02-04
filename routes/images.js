const Express = require('express')
const router = Express.Router()

router.post('/', async (req, res) => {
    res.send(req)
})

module.exports = router
