const {Schema, model} = require('mongoose')

const tgUser = new Schema({
    userId: {type: String, required: true, unique: true},
    username: {type: String, default: ''},
    name: {type: String},
    promo: {type: String, unique: true, default: ''},
    phone: {type: String},
    birthDate: {type: String}
})

module.exports = model('tgUser', tgUser)