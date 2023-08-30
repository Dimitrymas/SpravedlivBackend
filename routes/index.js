const Router = require('express')
const router = new Router()
const gameRouter = require('./gameRouter')
const userRouter = require('./userRouter')

router.use('/game', gameRouter)
router.use('/user', userRouter)

module.exports = router