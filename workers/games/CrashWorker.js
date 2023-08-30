const {CrashGame, BetCrash, User} = require("../../models/model");
const {io, redisClient} = require("../../init");
const SocketResponse = require('../../socket_response/SocketResponse')

class CrashWorker {
    constructor() {
        this.stoped = true
        this.timeInterval = null;
        this.game = null
    }

    async groupEmit(data) {
        io.to('crash').emit('crash', data)
    }

    async oneEmit(user, data) {
        try {
            const socketId = await redisClient.get(user._id.toString())
            io.to(socketId).emit('crash', data)
        } catch (e) {
        }
    }


    async stopGameLoop() {
        this.stoped = true
        clearInterval(this.timeInterval)
        this.game.status = 'finished'
        await this.game.save()
        this.game = null
    }

    async startGameLoop() {
        this.stoped = false
        await this.scheduleNextGame();
    }

    async sendBalance() {
        if (this.game) {
            const bets = await BetCrash.find({gameId: this.game._id, result: "pending"})
            bets.forEach(
                (bet) => {
                    User.findById(bet.user).then((user) => {
                        this.oneEmit(user, SocketResponse.Crash.updateWinAmount((bet.amount * this.game.currentMultiplier).toFixed(2)))
                    })
                }
            )
        }
    }

    async scheduleNextGame() {
        const randomX = 200; // Измените это значение на реально случайное число
        const newGame = new CrashGame({multiplier: randomX, startTime: Date.now() + 15000});
        this.game = newGame
        newGame.save();
        this.timeInterval = setInterval(() => {
            const remainingTime = newGame.startTime - Date.now();
            if (remainingTime <= 0) {
                clearInterval(this.timeInterval);
                newGame.status = 'running'
                newGame.save()
                this.startGame(newGame);
            } else {
                this.groupEmit(SocketResponse.Crash.updateTimer((remainingTime / 1000).toFixed(2)))
            }
        }, 10); // Отправка сообщения каждую секунду
    }

    async startGame(newGame) {
        const updateMultiplier = () => {
            if (newGame.multiplier <= newGame.currentMultiplier) {
                newGame.status = "finished"
                newGame.save()
                BetCrash.updateMany({result: "pending"}, {result: "lose"})
                this.groupEmit(SocketResponse.Crash.crashMultiplier(newGame.multiplier.toFixed(2)))
                this.scheduleNextGame(); // Запланировать следующую игру
                return;
            }

            newGame.currentMultiplier += Math.max(newGame.currentMultiplier / 300, 0.01);
            this.sendBalance()
            this.groupEmit(SocketResponse.Crash.updateMultiplier(newGame.currentMultiplier.toFixed(2)));
            redisClient.set("currentCrashMultiplier", newGame.currentMultiplier)
            // Динамическое изменение интервала обновления
            const delay = 170 / newGame.currentMultiplier ** (1 / 3) + 20;
            if (!this.stoped) {
                setTimeout(updateMultiplier, delay);
            }

        };

        await updateMultiplier(); // Инициализация первого вызова
    }
}

module.exports = new CrashWorker()