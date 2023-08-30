require('dotenv').config()
require('./db')
const express = require('express')
const path = require('path')
const cors = require('cors')

const {app, io, redisClient, server} = require("./init");

const startService = require('./servises/startService')
const ResponseHandler = require('./middleware/ResponseHandlingMiddleware')
const authSocketMiddleware = require('./middleware/authSocketMiddleware')
const router = require('./routes/index')
const crypto = require('crypto');
//creating hmac object


const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use('/api', router)
app.use(ResponseHandler)

io.use(authSocketMiddleware);

io.on('connection', async (socket) => {
    console.log('Новое подключение');
    await redisClient.set(socket.user.id, socket.id)

    socket.on('join', (room) => {
        socket.join(room)
    });

    // Событие при закрытии соединения клиентом
    socket.on('disconnect', async () => {
        await redisClient.del(socket.user.id)
    });
});


const start = async () => {
    try {
        await redisClient.connect()

        await startService()

        server.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}
start().then(() => {
    console.log("Successfully started")
})

