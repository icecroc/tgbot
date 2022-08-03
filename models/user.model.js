const {Schema, model} = require('mongoose')

const tgUser = new Schema({
    userId: {type: String},
    username: {type: String},
    name: {type: String},
    promo: {type: String},
    phone: {type: String},
    birthDate: {type: String},
    startDate: {type: String},
    regDate: {type: String}
})

module.exports = model('tgUsers', tgUser)