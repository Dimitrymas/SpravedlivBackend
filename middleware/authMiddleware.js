const jwt = require('jsonwebtoken')
const ApiError = require("../api_response/ApiError");

module.exports = function (req, res, next) {
    if (req.method === "OPTION") {
        next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return next(ApiError.badAuthentication())
        }
        req.user = jwt.verify(token, process.env.SECRET_KEY)
        next()
    } catch (e) {
        return next(ApiError.badAuthentication())
    }
}