const TelegramApi = require('node-telegram-bot-api')
const moment = require('moment')
const tgUser = require('./models/user.model')
const mongoose = require('mongoose')
const fs = require("fs");
const iconv = require('iconv-lite')
const config = require('config')
const token = config.get('TOKEN')
const dbPASS = config.get('dbPASS')
const groupId = '-1001737425964'

mongoose.connect(`mongodb+srv://mernapp:${dbPASS}@mernapp.jwkv0.mongodb.net/?retryWrites=true&w=majority`).then(() => console.log('MongoDB connected'))

const bot = new TelegramApi(token, {polling: true})
let currentAction = ''

bot.setMyCommands([
    {command: '/start', description: 'Инициализация бота'},
    {command: '/promo', description: 'Узнать ваш промокод'}
])

bot.onText(/\/start/, async msg => {
    const {id, username} = msg.chat
    const candidate = await tgUser.findOne({userId: id})
    const now = new Date()
    const startDate = moment(now).locale('ru').format('lll')
    if (!candidate) {
        await bot.sendMessage(id, `Приветствую вас, ${msg.chat.first_name}\nОтправьте контакт, и зарегистрируйтесь в системе, для получения промокодов и прочих плюшек`, {
            reply_markup: {
                keyboard: [
                    [{text: 'Отправить контакт', callback_data: 'contact', request_contact: true}]
                ], one_time_keyboard: true
            }
        })
        const user = new tgUser({userId: id, username: username, startDate: startDate})
        await user.save()
        currentAction = 'setContact'
        return;
    }
    if (candidate.promo === '') {
        await bot.sendMessage(id, `Приветствую вас, ${msg.chat.first_name}\nОтправьте контакт, и зарегистрируйтесь в системе, для получения промокодов и прочих плюшек`, {
            reply_markup: {
                keyboard: [
                    [{text: 'Отправить контакт', callback_data: 'contact', request_contact: true}]
                ], one_time_keyboard: true
            }
        })
        currentAction = 'setContact'
        return;
    }
    currentAction = 'done'
    await bot.sendMessage(id, `Вы уже зарегистрированы, как: "${candidate.name}"\nВаш промокод: ${candidate.promo}`)
    return bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
})

bot.onText(/\/info/, async msg => {
    const {id, username} = msg.chat
    await tgUser.find().then(async allUsers => {
        const users = allUsers.map((f) => {
            const userPhone = f.phone.substring(f.phone.length - 7)
            const userPhoneCode = f.phone.substr(0, f.phone.length - 7)
            return `${f.name};${f.username ?  `${f.username}` : ''};${f.phone[0] === '+' ? `(${userPhoneCode}) ${userPhone}` : `(+${userPhoneCode}) ${userPhone}`};${f.birthDate};${f.promo};${f.startDate};${f.regDate}`
        }).join('\n')

        const buf = iconv.encode(users, 'win1251')

        await fs.writeFile("./files/users.csv", buf,{}, (err) => {
            if (err) console.log(err)
        })
        currentAction = 'info'
        await bot.sendMessage(id, "Информация по пользователям")
        await bot.sendDocument(id, './files/users.csv')
    })
    currentAction = 'info'
    return console.log(`${id} - @${username} запросил информацию по пользователям`)
})

bot.onText(/\/promo/, async msg => {
    const {id} = msg.chat
    const candidate = await tgUser.findOne({userId: id})
    if (!candidate || candidate.promo === '') {
        await bot.sendMessage(id, `Вы ещё не регистрировались, пройдите регистрацию`)
        currentAction = 'setContact'
        return bot.sendMessage(id, `Приветствую вас, ${msg.chat.first_name}\nОтправьте контакт, и зарегистрируйтесь в системе, для получения промокодов и прочих плюшек`, {
            reply_markup: {
                keyboard: [
                    [{text: 'Отправить контакт', callback_data: 'contact', request_contact: true}]
                ], one_time_keyboard: true
            }
        })
    }
    await bot.sendMessage(id, `Ваш промокод: ${candidate.promo}`)
    return bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
})

bot.onText(/\/codes/, async msg => {
    const {id, username} = msg.chat
    await tgUser.find().then(async allUsers => {
        const promos = allUsers.map((f,i) => {
            return `${i + 1}. ${f.promo}`
        }).join('\n')
        currentAction = 'codes'
        await bot.sendMessage(id, promos)
    })
    return console.log(`${id} - @${username} запросил информацию по промокодам`)
})

bot.on('text', async msg => {
    const {id} = msg.chat
    const text = msg.text
    const uuid = _ => 'x0x0x0x0x0'.replace(/x|0/g, v => v === 'x'
        ? String.fromCharCode(Math.floor(Math.random() * 26) + 97).toUpperCase()
        : Math.floor(Math.random() * 10)).toUpperCase()
    const promocode1 = uuid()
    const promocode = `BUZZ_${promocode1}`
    const candidate = await tgUser.findOne({userId: id})
    switch (currentAction) {
        case 'setName' :
            if (candidate.name) {
                currentAction = 'setBirthDay'
                return bot.sendMessage(id, `Вы уже зарегестрированы как: "${candidate.name}"\nТеперь введите вашу дату рождения в формате 'дд.мм.гггг'`)
            }
            await tgUser.findOneAndUpdate({userId: id}, {name: text})
            console.log(`${msg.text} зарегестрирован`)
            currentAction = 'setBirthDay'
            return bot.sendMessage(id, `Ваше ФИО успешно записано\nТеперь введите вашу дату рождения в формате 'дд.мм.гггг'`)
        case 'setBirthDay' :
            if (candidate.birthDate) {
                currentAction = 'done'
                return bot.sendMessage(id, `Вы уже полностью зарегистрированы, ${candidate.name}\nВаш промокод: ${candidate.promo}`)
            }
            const now = new Date()
            const regDate = moment(now).locale('ru').format('lll')
            await tgUser.findOneAndUpdate({userId: id}, {birthDate: text, promo: promocode, regDate: regDate})
            console.log(`${candidate.name} зарегистрирован(а) с промокодом: ${promocode}`)
            await bot.sendMessage(groupId, `${candidate.name} зарегистрирован с промокодом: ${promocode}`)
            currentAction = 'done'
            await bot.sendMessage(id, `Поздравляем, ты успешно зарегистрировался.\nЛови свой первый промокод на 10 000 сум: ${promocode}`)
            return bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
        case 'info' :
            break
        case '' :
            break
    }
})

bot.on('contact', async msg => {
    const {id} = msg.chat
    const contact = msg.contact.phone_number
    if(currentAction !== 'setContact') return
    const candidate = await tgUser.findOne({phone: msg.contact.phone_number})
    if (candidate) {
        currentAction = 'setName'
        await tgUser.findOneAndUpdate({userId: id}, {phone: contact})
        return bot.sendMessage(id,`Контакт уже зарегестрирован\nТеперь введи свои ФИО`)
    }
    await tgUser.findOneAndUpdate({userId: id}, {phone: contact})
    currentAction = 'setName'
    console.log(`${id} зарегистрирован с номером ${contact}`)
    return bot.sendMessage(id, `Контакт успешно зарегистрирован\nТеперь введи свои ФИО`)
})


// TODO
// Добавить к промокодам BUZZ_ в начале