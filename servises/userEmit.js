const {redisClient, io} = require("../init");

module.exports = async (user, data) => {
    try {
        const socketId = await redisClient.get(user._id.toString())
        io.to(socketId).emit('user', data)
    } catch (e) {
    }
}
