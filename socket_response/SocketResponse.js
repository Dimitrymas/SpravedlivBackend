class Crash extends Object {

    updateTimer(timer) {
        return {type: "updateTimer", value: timer}
    }

    updateMultiplier(multiplier) {
        return {type: "updateMultiplier", value: multiplier}
    }

    crashMultiplier(multiplier) {
        return {type: "crashMultiplier", value: multiplier}
    }

    newBet(value) {
        return {type: "newBet", value: value}
    }

    updateBet(value) {
        return {type: "updateBet", value: value}
    }

    updateWinAmount(value) {
        return {type: "updateWinAmount", value: value}
    }
}


class User extends Object {
    updateBalance(balance) {
        return {type: "updateBalance", value: balance}
    }
}

class SocketResponse extends Object {
    constructor(props) {
        super(props);
        this.Crash = new Crash()
        this.User = new User()
    }
}

module.exports = new SocketResponse()
