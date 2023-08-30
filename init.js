const express = require("express");
const {createClient} = require("redis");
const http = require("http");
const socketIo = require("socket.io");


const app = express()
const redisClient = createClient();
const server = http.createServer(app);
const io = socketIo(server, { transports : ['websocket'] });


module.exports = {app, redisClient, server, io}