const Router = require('express')
const router = new Router()
const userController = require('../controllers/userController')
const authMiddleware = require('../middleware/authMiddleware')
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware')


router.post('/login/', userController.login)
router.post('/registration/', userController.registration)
router.get('/profile/',  authMiddleware,  userController.profile)


module.exports = router