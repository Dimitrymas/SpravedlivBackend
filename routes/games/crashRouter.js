const Router = require('express')
const router = new Router()
const {CrashController} = require('../../controllers/gameController')
const checkRoleMiddleware = require('../../middleware/checkRoleMiddleware')
const authMiddleware = require('../../middleware/authMiddleware')


router.post('/stop/', checkRoleMiddleware('ADMIN'), CrashController.stopGame)
router.post('/start/', checkRoleMiddleware('ADMIN'), CrashController.startGame)
router.post('/bet/', authMiddleware, CrashController.newBet)
router.post('/takebet/', authMiddleware, CrashController.takeBet)


module.exports = router