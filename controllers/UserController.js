const bcrypt = require('bcrypt')
const {User} = require('../models/model')
const jwt = require('jsonwebtoken')
const ApiError = require("../api_response/ApiError");
const ApiSuccess = require("../api_response/ApiSuccess");
const {io, redisClient} = require('../init')


// Генерация токенов
function generateJWT(user) {
    return jwt.sign(user, process.env.SECRET_KEY);
}

class UserController {
    async registration(req, res, next) {
        const {username, password} = req.body
        if (!username || !password) {
            return next(ApiError.badRequest('Пароль или username ошибочный'))
        }
        const candidate = await User.findOne({username})
        if (candidate) {
            return next(ApiError.badRequest('Имя пользователя занято'))
        }
        const hashPassword = await bcrypt.hash(password, 6)
        const user = new User({username, password: hashPassword})
        try {
            await user.save()
        } catch (e) {
            return next(ApiError.internal("Ошибка создания пользователя"))
        }
        const JWT = generateJWT({id: user._id, role: user.role})
        return next(
            ApiSuccess.success({JWT})
        )
    }

    async login(req, res, next) {
        const {username, password} = req.body
        const user = await User.findOne({username})
        if (!user) {
            return next(ApiError.badRequest(`Пользователь ${username} не найден`))
        }
        let comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.badRequest('Пароль не верный'))
        }
        const JWT = generateJWT({id: user._id, role: user.role})
        return next(
            ApiSuccess.success({JWT})
        )
    }

    async profile(req, res, next) {
        const user = await User.findById(req.user.id)
        return next(ApiSuccess.success({
            avatar: user.avatar, balance: user.balance, roles: user.role, ban: user.ban, banReason: user.banReason
        }))
    }

}

module.exports = new UserController()