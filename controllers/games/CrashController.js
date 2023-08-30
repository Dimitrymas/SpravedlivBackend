const ApiSuccess = require("../../api_response/ApiSuccess");
const ApiError = require("../../api_response/ApiError");
const crashWorker = require('../../workers/games/crashWorker')
const {cra, CrashGame, BetCrash, User} = require("../../models/model");
const {redisClient} = require("../../init");
const SocketResponse = require('../../socket_response/SocketResponse')
const userEmit = require('../../servises/userEmit')
class CrashController {
    async stopGame(req, res, next) {
        try {
            if (crashWorker.game) {
                crashWorker.stopGameLoop()
                return next(ApiSuccess.success({message: "Игра остановлена"}))

            } else {
                return next(ApiError.badRequest({message: "Игра уже остановлена"}))
            }
        } catch {
            return next(ApiError.badRequest({message: "Игра не была остановлена"}))
        }
    }

    async startGame(req, res, next) {
        try {
            if (!crashWorker.game) {
                crashWorker.startGameLoop()
            } else {
                return next(ApiError.badRequest({message: "Игра уже запущена"}))

            }
            return next(ApiSuccess.success({message: "Игра включена"}))
        } catch {
            return next(ApiError.badRequest({message: "Игра не была запущена"}))
        }
    }

    async newBet(req, res, next) {
        const {amount, auto, autoMultiplier} = req.body
        const user = await User.findById(req.user.id)
        const game = await CrashGame.findOne({status: "waiting"})
        if (game !== null) {
            const userBets = await BetCrash.findOne({result: "pending", user: user._id, gameId:game._id})
            if (userBets !== null) {
                return next(ApiError.badRequest('Ставка уже создана'))
            }
            if (amount <= user.balance) {
                const bet = new BetCrash({user: user._id, amount, auto, autoMultiplier, gameId: game._id})
                user.balance -= amount
                try {
                    await Promise.all([bet.save(), user.save()])
                    const betInformation = SocketResponse.Crash.newBet({
                        amount: bet.amount, id: bet._id, user: {avatar: user.avatar, username: user.username}
                    })
                    userEmit(user, SocketResponse.User.updateBalance(user.balance))
                    crashWorker.groupEmit(betInformation)
                    return next(ApiSuccess.success({message: "Ставка создана"}))
                } catch {
                    return next(ApiError.internal('Ошибка создания ставки'))
                }
            } else {
                return next(ApiError.badRequest('У вас недостаточно средств на балансе'))
            }
        } else {
            return next(ApiError.badRequest('Дождитесь следующей игры'))
        }
    }

    async takeBet(req, res, next) {
        const game = await CrashGame.findOne({status: "running"})
        if (game !== null) {
            const user = await User.findById(req.user.id)
            const bet = await BetCrash.findOne({user: req.user.id, gameId: game._id, result: "pending"})
            if (bet !== null) {
                const multiplayer = await redisClient.get('currentCrashMultiplier')
                user.balance += bet.amount * multiplayer
                bet.multiplayer = multiplayer
                try {
                    bet.result = 'win'
                    await Promise.all([bet.save(), user.save()])
                    const betInformation = SocketResponse.Crash.updateBet({
                        amount: bet.amount,
                        multiplayer: bet.multiplayer,
                        id: bet._id,
                        user: {avatar: user.avatar, username: user.username}
                    })
                    userEmit(user, SocketResponse.User.updateBalance(user.balance.toFixed(2)))
                    crashWorker.groupEmit(betInformation)
                    return next(ApiSuccess.success({message: "Ставка была выведена"}))
                } catch (e) {
                    console.log(e)
                    return next(ApiError.badRequest('Ошибка сохранение данных'))
                }
            } else {
                return next(ApiError.badRequest('Ставка не была найдена'))
            }
        } else {
            return next(ApiError.badRequest('Нет запущенной игры'))
        }

    }

}

module.exports = new CrashController()
