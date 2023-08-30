const jwt = require('jsonwebtoken')
const ApiError = require("../api_response/ApiError");

module.exports = function (socket, next) {
    try {
        const token = socket.handshake.auth.token.split(" ")[1]
        if (!token) {
            return next(ApiError.badAuthentication())
        }
        socket.user = jwt.verify(token, process.env.SECRET_KEY)
        next()
    } catch (e) {
        return next(ApiError.badAuthentication())
    }
}