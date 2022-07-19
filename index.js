const TelegramApi = require('node-telegram-bot-api')
const tgUser = require('./models/user.model')
const mongoose = require('mongoose')
const fs = require("fs");
const iconv = require('iconv-lite')
const token = '5406824758:AAFsZPqJtvvEnhsUXMXTE_7SZm5nDJujeTU'
mongoose.connect('mongodb+srv://mernapp:mernapppass@mernapp.jwkv0.mongodb.net/?retryWrites=true&w=majority').then(() => console.log('MongoDB connected'))

const bot = new TelegramApi(token, {polling: true})
let currentAction = ''

bot.setMyCommands([
    {command: '/start', description: 'Инициализация бота'},
    {command: '/promo', description: 'Узнать ваш промокод'}
])

bot.onText(/\/start/, async msg => {
    const {id} = msg.chat
    const candidate = await tgUser.findOne({userId: id})
    console.log(candidate)
    if (!candidate || candidate.promo === '') {
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
    return bot.sendMessage(id, `Вы уже зарегистрированы, как: "${candidate.name}"\nВаш промокод: ${candidate.promo}`)
})

/*
bot.onText(/\/register/, async msg => {
    const {id} = msg.chat
    await bot.sendMessage(id, `Введите своё ФИО`)
    setName = true
})
*/

bot.onText(/\/info/, async msg => {
    const {id, username} = msg.chat
    await tgUser.find().then(async allUsers => {
        const users = allUsers.map((f, i) => {
            const userPhone = f.phone.substring(f.phone.length - 7)
            const userPhoneCode = f.phone.substr(0, f.phone.length - 7)
            console.log(userPhoneCode + ' ' + userPhone)
            return `${f.name};${f.username ?  `${f.username}` : ''};${f.phone[0] === '+' ? `(${userPhoneCode}) ${userPhone}` : ` (+${userPhoneCode}) ${userPhone}`};${f.birthDate};${f.promo}`

        }).join('\n')

        const buf = iconv.encode(users, 'win1251')

        await fs.writeFile("users.csv", buf,{}, (err) => {
            if (err) console.log(err)
        })
        currentAction = 'info'
        await bot.sendMessage(id, "Информация по пользователям")
        await bot.sendDocument(id, 'users.csv')
    })
    currentAction = 'info'
    return console.log(`${id} - @${username} запросил информацию по пользователям`)
})

bot.onText(/\/promo/, async msg => {
    const {id, username} = msg.chat
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
    return bot.sendMessage(id, `Ваш промокод: ${candidate.promo}`)
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
    const uuid = _ => 'xxxxxx0000'.replace(/x|0/g, v => v === 'x'
        ? String.fromCharCode(Math.floor(Math.random() * 26) + 97).toUpperCase()
        : Math.floor(Math.random() * 10)).toUpperCase()
    const promocode = uuid()
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
            await tgUser.findOneAndUpdate({userId: id}, {birthDate: text, promo: promocode})
            console.log(`${candidate.name} зарегистрирован с промокодом: ${promocode}`)
            currentAction = 'done'
            return bot.sendMessage(id, `Поздравляем, вы успешно зарегистрировались в системе\nВаш промокод: ${promocode}`)
        case 'info' :
            break
        case '' :
            console.log(currentAction)
            return bot.sendMessage(id, `Я вас не понимаю`)
    }
})

bot.on('contact', async msg => {
    const {id, username} = msg.chat
    const contact = msg.contact.phone_number
    if(currentAction !== 'setContact') return
    const candidate = await tgUser.findOne({phone: msg.contact.phone_number})
    if (candidate) {
        currentAction = 'setName'
        return bot.sendMessage(id,`Ваш контакт уже зарегестрирован\nТеперь введите Ваше ФИО`)
    }
    const user = new tgUser({userId: id, username: username, phone: contact})
    await user.save()
    currentAction = 'setName'
    console.log(`${id} зарегистрирован с номером ${contact}`)
    return bot.sendMessage(id, `Контакт успешно зарегистрирован\nТеперь введите Ваше ФИО`)
})


// TODO
// Запрашивать контакт, имя, дату рождения пользователя в процессе регистрации.
// Поменять setName на Action, и сделать Switch по проверке этого Action для процесса регистрации
// Action = 'Contact' - Следующее сообщение идёт как контакт
// Action = 'Name' - Следующее сообщение станет именем пользователя
// Action = 'bDate' - Следующее сообщение Дата рождения