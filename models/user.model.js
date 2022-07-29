const {Schema, model} = require('mongoose')

const tgUser = new Schema({
    userId: {type: String, required: true, unique: true},
    username: {type: String, default: ''},
    name: {type: String},
    promo: {type: String, default: ''},
    phone: {type: String},
    birthDate: {type: String},
    startDate: {type: String},
    regDate: {type: String}
})

module.exports = model('tgUser', tgUser)