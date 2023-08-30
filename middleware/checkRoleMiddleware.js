const jwt = require('jsonwebtoken')
const ApiError = require("../api_response/ApiError");

module.exports = function(role) {
    return function (req, res, next) {
        if (req.method === "OPTION") {
            next()
        }
        try {
            const token = req.headers.authorization.split(' ')[1]

            if (!token) {
                return next(ApiError.badAuthentication())
            }
            const decoded = jwt.verify(token, process.env.SECRET_KEY)
            if (!decoded.role.includes(role)) {
                return next(ApiError.forbidden("Нет доступа"))
            }
            req.user = decoded
            next()
        } catch (e) {
            return next(ApiError.badAuthentication())
        }
    }
}