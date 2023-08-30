const Router = require('express')
const router = new Router()
const crashRouter = require("./games/crashRouter");


router.use('/crash', crashRouter)


module.exports = router