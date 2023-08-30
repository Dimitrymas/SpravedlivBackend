const {Schema, model} = require("mongoose");

const UserSchema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    role: {type: [String], default: ['USER']},
    balance: {type: Number, default: 0},
    avatar: {type: String, default: ''},
    ban: {type: Boolean, default: false},
    banReason: {type: String, default: ''},
    referrals: [{type: Schema.Types.ObjectId, ref: 'User'}],
    referral: {type: Schema.Types.ObjectId, ref: 'User'}
})

const PromocodeSchema = new Schema({
    amount: Number,
    activations: Number,
    activators: [{type: Schema.Types.ObjectId, ref: 'User'}],
    active: {type: Boolean, default: true}
})


const BetCrashSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    amount: {type: Number, required: true},
    auto: {type: Boolean, default: false},
    multiplier: {type: Number},
    autoMultiplier: {type: Number},
    gameId: {type: Schema.Types.ObjectId, ref: 'CrashGame', required: true},
    result: {type: String, enum: ['pending', 'win', 'lose'], default: 'pending'},
    timestamp: {type: Date, default: Date.now},
});


const CrashGameSchema = new Schema({
    multiplier: {type: Number, required: true},
    currentMultiplier: {type: Number, default: 1},
    status: {type: String, enum: ['waiting', 'running', 'finished'], default: 'waiting'},
    startTime: {type: Date, default: Date.now},
    endTime: {type: Date}
});

const User = model('User', UserSchema);
const BetCrash = model('BetCrash', BetCrashSchema);
const CrashGame = model('CrashGame', CrashGameSchema);
const Promocode = model('Promocode', PromocodeSchema);

module.exports = {User, BetCrash, CrashGame, Promocode}

