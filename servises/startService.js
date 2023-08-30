const {redisClient} = require('../init')
const {CrashGame} = require('../models/model')

module.exports = async () => {
    await redisClient.flushAll()
    const notFinishedGames = (await CrashGame.find({status: {$ne: 'finished'}}))
    notFinishedGames.forEach((item) => {
        item.status = 'finished'
        item.save()
    })
}