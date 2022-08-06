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

const bot = new TelegramApi(token, {polling: true})

async function errorMessage(e) {
    await bot.sendMessage('422349079', `Ошибка: ${e}`)
}

async function sendContactRequest(id, first_name) {
    return bot.sendMessage(id, `Приветствую вас, ${first_name}\nОтправьте контакт, и зарегистрируйтесь в системе, для получения промокода на первую покупку своего девайса в магазинах The Buzz`, {
        reply_markup: {keyboard: [
            [{text: 'Отправить контакт', callback_data: 'contact', request_contact: true}],
            [{text: 'Промокод'}]
            ], one_time_keyboard: true}
    })
}


const start = async () => {
    mongoose.connect(`mongodb+srv://mernapp:${dbPASS}@mernapp.jwkv0.mongodb.net/?retryWrites=true&w=majority`).then(() => console.log('MongoDB connected'))
    //mongoose.connect(`mongodb://localhost:27017/tgbot`)


    bot.onText(/\/start/, async msg =>{
        const {id, username, first_name} = msg.chat
        const startDate1 = moment(new Date()).locale('ru').format('LL')
        const startDate = startDate1.substring(0, startDate1.length -1)
        try {
            const candidate = await tgUser.findOne({userId: id})
            if (!candidate) {
                const user = new tgUser({userId: id, username: username ? username : '', startDate: startDate})
                await user.save()
                return sendContactRequest(id, first_name)
            } else if (candidate) {
                if (candidate.promo) {
                    await bot.sendMessage(id, `Вы уже зарегистрированны, ваш промокод ${candidate.promo}\nПредъявите этот промокод в любом магазине The Buzz`)
                    return  bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
                } else {
                    return sendContactRequest(id, first_name)
                }
            }
        } catch (e) {
            await errorMessage(e)
        }
    })

    bot.onText(/^([А-Яа-яё]{1}[а-яё]{1,23}|[A-Z]{1}[a-z]{1,23})[' ']([А-Яа-яё]{1}[а-яё]{1,23}|[A-Z]{1}[a-z]{1,23})$/, async msg => {
        const id = msg.chat.id
        const name = msg.text
        try {
            const candidate = await tgUser.findOne({userId: id})
            if (!candidate) {
                return bot.sendMessage(id, `Что-то пошло не по плану, попробуйте снова с помощью команды \n/start`)
            } else if (candidate) {
                if (candidate.promo) {
                    await bot.sendMessage(id, `Вы уже зарегистрированны, ваш промокод ${candidate.promo}\nПредъявите этот промокод в любом магазине The Buzz`)
                    return  bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
                } else {
                    await tgUser.findOneAndUpdate({userId: id}, {name: name})
                    return bot.sendMessage(id, `Ваше ФИО успешно записано\nТеперь введите вашу дату рождения в формате 'дд.мм.гггг'\nК примеру 12.12.1999`)
                }
            }
        } catch (e) {
            await errorMessage(e)
        }
    })

    bot.onText(/^([А-Яа-яё]{1}[а-яё]{1,23}|[A-Z]{1}[a-z]{1,23})[' ']([А-Яа-яё]{1}[а-яё]{1,23}|[A-Z]{1}[a-z]{1,23})[' ']([А-Яа-яё]{1}[а-яё]{1,23}|[A-Z]{1}[a-z]{1,23})$/, async msg => {
        const id = msg.chat.id
        const name = msg.text
        try {
            const candidate = await tgUser.findOne({userId: id})
            if (!candidate) {
                return bot.sendMessage(id, `Что-то пошло не по плану, попробуйте снова с помощью команды \n/start`)
            } else if (candidate) {
                if (candidate.promo) {
                    await bot.sendMessage(id, `Вы уже зарегистрированны, ваш промокод ${candidate.promo}\nПредъявите этот промокод в любом магазине The Buzz`)
                    return  bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
                } else {
                    await tgUser.findOneAndUpdate({userId: id}, {name: name})
                    return bot.sendMessage(id, `Ваше ФИО успешно записано\nТеперь введите вашу дату рождения в формате 'дд.мм.гггг'\nК примеру 12.12.1999`)
                }
            }
        } catch (e) {
            await errorMessage(e)
        }
    })

    bot.onText(/\d{1}[.]?\d{1}[.]?\d/, async msg => {
        const id = msg.chat.id
        const regDate1 = moment(new Date()).locale('ru').format('LL')
        const regDate = regDate1.substring(0, regDate1.length -1)
        const uuid = _ => 'BUZZ_x0x0x0x0x0'.replace(/x|0/g, v => v === 'x'
            ? String.fromCharCode(Math.floor(Math.random() * 26) + 97).toUpperCase()
            : Math.floor(Math.random() * 10)).toUpperCase()
        const code = uuid()
        const birthDate = msg.text
        try {
            const candidate = await tgUser.findOne({userId: id})
            if (!candidate) {
                return bot.sendMessage(id, `Что-то пошло не по плану, попробуйте снова с помощью команды \n/start`)
            } else if (candidate) {
                if (candidate.promo) {
                    await bot.sendMessage(id, `Вы уже зарегистрированны, ваш промокод ${candidate.promo}\nПредъявите этот промокод в любом магазине The Buzz`)
                    return  bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
                } else {
                    await tgUser.findOneAndUpdate({userId: id}, {promo: code, regDate: regDate, birthDate: birthDate})
                    await bot.sendMessage(id, `Поздравляем с регистрацией\nЛови свой первый промокод на 10 000 сум : ${code}\nПредъявите этот промокод в любом магазине The Buzz`)
                    await bot.sendMessage(groupId, `${candidate.name} зарегистрирован(а) с промокодом: ${code}`)
                    return bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
                }
            }
        } catch (e) {
            await errorMessage(e)
        }
    })

    bot.on('contact', async msg => {
        const {id} = msg.chat
        const phone = msg.contact.phone_number
        try {
            const candidate = await tgUser.findOne({userId: id})
            if (!candidate) {
                return bot.sendMessage(id, `Что-то пошло не по плану, попробуйте снова с помощью команды \n/start`)
            } else if (candidate) {
                if (candidate.promo) {
                    await bot.sendMessage(id, `Вы уже зарегистрированны, ваш промокод ${candidate.promo}\nПредъявите этот промокод в любом магазине The Buzz`)
                    return  bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
                } else {
                    await tgUser.findOneAndUpdate({userId: id}, {phone: phone})
                    return bot.sendMessage(id, `Контакт успешно зарегистрирован (обновлён)\nТеперь введи свои ФИО\nК примеру: Иванов Иван Иванович`)
                }
            }
        } catch (e) {
            await errorMessage(e)
        }
    })

    bot.on('message', async msg => {
        const {id, first_name} = msg.chat
        const text = msg.text
        try {
            const candidate = await tgUser.findOne({userId: id})
            if (text === 'Промокод') {
                if (!candidate) {
                    await bot.sendMessage(id, `Видимо вы ещё не прошли регистрацию до конца`)
                    return sendContactRequest(id, first_name)
                } else if (candidate) {
                    if (candidate.promo) {
                        await bot.sendMessage(id, `Ваш промокод ${candidate.promo}\nПредъявите этот промокод в любом магазине The Buzz`)
                        return  bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
                    } else {
                        await bot.sendMessage(id, `Видимо вы ещё не прошли регистрацию до конца`)
                        return sendContactRequest(id, first_name)
                    }
                }
            } else {
                return
            }
        } catch (e) {
            await errorMessage(e)
        }
    })

    bot.onText(/\/info/, async msg => {
        const {id} = msg.chat
        try {
            await tgUser.find().then(async allUsers => {
                const users = allUsers.map((f) => {
                const userPhone = f.phone ? f.phone.substring(f.phone.length - 7) : ''
                const userPhoneCode = f.phone ? f.phone.substr(0, f.phone.length - 7) : ''
                const phone = `${userPhoneCode[0] === '+' ? `(${userPhoneCode}) ${userPhone}` : `(+${userPhoneCode} ${userPhone})`}`
                    return `${f.name ? `${f.name}` : 'не ввели'};${f.username ? `${f.username}` : 'нет username'};${f.phone ? `${phone}` : `не ввели`};${f.birthDate ? `${f.birthDate}` : 'не ввели'};${f.promo ? `${f.promo}` : `регистрацию не закончили`};${f.startDate};${f.regDate ? `${f.regDate}` : `регистрацию не закончили`}`
                }).join('\n')

                const buf = iconv.encode(users, 'win1251')

                await fs.writeFile("./files/users.csv", buf, {}, async (err) => {
                    if (err) console.log(err)
                })

                await bot.sendMessage(id, `Файл с информацией по пользователям`)
                return bot.sendDocument(id, './files/users.csv')
            })
        } catch (e) {
            await errorMessage(e)
        }
    })

    bot.onText(/\/codes/, async msg => {
        const {id} = msg.chat
        try {
            await tgUser.find().then(async allUsers => {
                const codes = allUsers.map((f) => {
                    return `${f.promo}`
                }).join('\n')

                await fs.writeFile("./files/codes.csv", codes, {}, async (err) => {
                    if (err) console.log(err)
                })

                await bot.sendMessage(id, `Файл с промокодами пользователей`)
                return bot.sendDocument(id, './files/codes.csv')
            })
        } catch (e) {
            await errorMessage(e)
        }
    })

    bot.onText(/\/list/, async msg => {
        const {id} = msg.chat
        try {
            await tgUser.find().then(async allUsers => {
                const codes = allUsers.map((f, i) => {
                    //const result = `${i + 1}.${f.name.padEnd(30, ' ')} ${f.promo}`
                    const result = `${i + 1} ${f.name ? `${f.name.padEnd(30, '')}` : ''} ${f.promo ? `${f.promo}` : 'Регистрация не закончена'}`
                    return result
                }).join(`\n`)

                return bot.sendMessage(id, codes)
            })
        } catch (e) {
            await errorMessage(e)
        }
    })

    bot.onText(/\/commands/, async msg => {
        const {id} = msg.chat
        return bot.sendMessage(id, `Список команд бота\n/info - получить файл с данными пользователей\n/codes - получить файл с промокодами пользователей\n/list - бот отправит список пользователей с их промокодами`)
    })

}

start()



// bot.onText(/\/start/, async msg => {
//     const {id, username, first_name} = msg.chat
//     const startDateTg = moment(new Date()).locale('ru').format('lll')
//     const candidate = await tgUser.findOne({userId: id})
//     if (currentAction === 'start') {
//         if (!candidate) {
//             try {
//                 const user = new tgUser({userId: id, username: username ? username : '', startDate: startDateTg})
//                 await user.save()
//             } catch (e) {
//                 await errorMessage(e)
//             }
//             currentAction = 'contact'
//             return sendContactRequest(id, first_name)
//             // } else if (candidate.promo) {
//             //     return bot.sendMessage(id, `Твой промокод ${candidate.promo}`)
//             // }
//         }   else if (candidate && candidate.promo) {
//                 await bot.sendMessage(id, `Вы уже зарегистрированны, ваш промокод ${candidate.promo} `)
//                 return  bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
//         }
//             else if (candidate && !candidate.promo) {
//                 currentAction = 'contact'
//                 return sendContactRequest(id, first_name)
//         }
//     } else if (candidate && candidate.promo) {
//         await bot.sendMessage(id, `Вы уже зарегистрированны, ваш промокод ${candidate.promo} `)
//         return  bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
//     } else if (candidate && !candidate.promo) {
//         currentAction = 'contact'
//         return sendContactRequest(id, first_name)
//     }
// })
//
// bot.on('contact', async msg => {
//     const {id} = msg.chat
//     const phone = msg.text
//     if (currentAction === 'contact') {
//         try {
//             await tgUser.findOneAndUpdate({userId: id}, {phone: phone})
//         } catch (e) {
//             await errorMessage(e)
//         }
//         currentAction = 'name'
//         return bot.sendMessage(id, `Контакт успешно зарегистрирован (обновлён)\nТеперь введи свои ФИО`)
//     } else {
//         return bot.sendMessage(id, `Что-то пошло не так, начни сначала используя команду \n/start`)
//     }
// })
//
// bot.on('message', async msg => {
//     const {id} = msg.chat
//     const text = msg.text
//     switch (currentAction) {
//         case 'name':
//             try {
//                 await tgUser.findOneAndUpdate({userId: id}, {name: text})
//             } catch (e) {
//                 await errorMessage(e)
//             }
//             await bot.sendMessage(id, `Ваше ФИО успешно записано\nТеперь введите вашу дату рождения в формате 'дд.мм.гггг'`)
//             currentAction = 'bday'
//             break
//         case 'bday':
//             const regDateTg = moment(new Date()).locale('ru').format('lll')
//             const uuid = _ => 'BUZZ_x0x0x0x0x0'.replace(/x|0/g, v => v === 'x'
//                 ? String.fromCharCode(Math.floor(Math.random() * 26) + 97).toUpperCase()
//                 : Math.floor(Math.random() * 10)).toUpperCase()
//             const code = uuid()
//             const candidate = await tgUser.findOne({userId: id}).exec()
//             if (candidate.promo) {
//                 console.log(candidate.promo)
//                 await bot.sendMessage(id, `Твой промокод ${candidate.promo}`)
//                 break
//             } else {
//                 try {
//                     await tgUser.findOneAndUpdate({userId: id}, {birthDate: text, promo: code, regDate: regDateTg})
//                 } catch (e) {
//                     await errorMessage(e)
//                 }
//                 const candidate = await tgUser.findOne({userId: id}).exec()
//                 await bot.sendMessage(id, `Поздравляем с регистрацией\nЛови свой первый промокод на 10 000 сум : ${code}`)
//                 await bot.sendMessage(groupId, `${candidate.name} зарегистрирован(а) с промокодом: ${code}`)
//                 await bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
                currentAction = 'finish'
//                 break
//             }
//         case 'finish':
//     }
// })
//



// bot.onText(/\/start/, async msg => {
//     const {id,username} = msg.chat
//     const startDate = moment(new Date()).locale('ru').format('lll')
//     const candidate = await tgUser.findOne({userId: id})
//     if (!candidate) {
//         await bot.sendMessage(id, `Приветствую вас, ${msg.chat.first_name}\nОтправьте контакт, и зарегистрируйтесь в системе, для получения промокодов и прочих плюшек`, {
//             reply_markup: {keyboard: [[{text: 'Отправить контакт', callback_data: 'contact', request_contact: true}]], one_time_keyboard: true}
//         })
//         currentAction = 'contact'
//         try {
//             const user = new tgUser({userId: id, username: username ? username : '', startDate: startDate})
//         await user.save()
//         } catch (e) {
//             await errorMessage(e)
//         }
//     } else {
//         await bot.sendMessage(id, `Приветствую вас, ${msg.chat.first_name}\nОтправьте контакт, и зарегистрируйтесь в системе, для получения промокодов и прочих плюшек`, {
//             reply_markup: {keyboard: [[{text: 'Отправить контакт', callback_data: 'contact', request_contact: true}]], one_time_keyboard: true}
//         })
//         currentAction = 'contact'
//     }
// })





// bot.onText(/\/start/, async msg => {
//     const {id, username} = msg.chat
//     const startDate = moment(new Date()).locale('ru').format('lll')
//     const candidate = await tgUser.findOne({userId: id})
//     if (!candidate)  {
//             await bot.sendMessage(id, `Приветствую вас, ${msg.chat.first_name}\nОтправьте контакт, и зарегистрируйтесь в системе, для получения промокодов и прочих плюшек`, {
//                 reply_markup: {
//                     keyboard: [
//                         [{text: 'Отправить контакт', callback_data: 'contact', request_contact: true}]
//                     ], one_time_keyboard: true
//                 }
//             })
//             currentAction = 'contact'
//             try {
//                 const user = new tgUser({userId: id, username: username ? username : '', startDate: startDate})
//                 await user.save()
//             } catch (e) {
//                 await errorMessage(e)
//             }
//         } else if (candidate.promo) {
//             await bot.sendMessage(id, `Вы уже зарегистрированы\nВаш промокод ${candidate.promo}`)
//             return bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
//         }
// })
//
// bot.on('text', async msg => {
//     const {id} = msg.chat
//     const text = msg.text
//     const uuid = _ => 'BUZZ_x0x0x0x0x0'.replace(/x|0/g, v => v === 'x'
//          ? String.fromCharCode(Math.floor(Math.random() * 26) + 97).toUpperCase()
//          : Math.floor(Math.random() * 10)).toUpperCase()
//     const promocode = uuid()
//     const candidate = await tgUser.findOne({userId: id})
//         switch (currentAction) {
//             case 'name':
//                 try {
//                     await tgUser.findOneAndUpdate({userId: id}, {name: text})
//                 } catch (e) {
//                     await errorMessage(e)
//                 }
//                 currentAction = 'bday'
//                 return bot.sendMessage(id, `ФИО записали\nТеперь введи дату рождения в формате 'дд.мм.гггг'`)
//             case 'bday':
//                 try {
//                     const regDate = moment(new Date()).locale('ru').format('lll')
//                     await tgUser.findOneAndUpdate({userId: id}, {birthDate: text, promo: promocode, regDate: regDate})
//                 }
//                 catch (e) {
//                     await errorMessage(e)
//                 }
//                 currentAction = 'done'
//                 await bot.sendMessage(id, `Поздравляем с регистрацией\nЛови свой первый промокод на 10 000 сум : ${promocode}`)
//                 await bot.sendMessage(groupId, `${candidate.name} зарегистрирован(а) с промокодом: ${promocode}`)
//                 return bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
//             case 'done':
//                 await bot.sendMessage(id, `Вы уже зарегистрированы\nВаш промокод ${candidate.promo}`)
//                 return bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
//         }
// })
//
// bot.on('contact', async msg => {
//     const {id} = msg.chat
//     const contact = msg.contact.phone_number
//     if (currentAction === 'contact') {
//         try {
//             await tgUser.findOneAndUpdate({userId: id}, {phone: contact})
//         } catch (e) {
//             errorMessage(e)
//         }
//         currentAction = 'name'
//         return bot.sendMessage(id, `Контакт успешно зарегистрирован (обновлён)\nТеперь введи свои ФИО`)
//     } else {
//         console.log(currentAction)
//         return bot.sendMessage(id, `Что-то пошло не так, инициализируй бот снова командой\n/start`)
//     }
// })


// bot.onText(/\/start/, async msg => {
//     const {id, username} = msg.chat
//     const candidate = await tgUser.findOne({userId: id})
//     const now = new Date()
//     const startDate = moment(now).locale('ru').format('lll')
//     if (!candidate) {
//         await bot.sendMessage(id, `Приветствую вас, ${msg.chat.first_name}\nОтправьте контакт, и зарегистрируйтесь в системе, для получения промокодов и прочих плюшек`, {
//             reply_markup: {
//                 keyboard: [
//                     [{text: 'Отправить контакт', callback_data: 'contact', request_contact: true}]
//                 ], one_time_keyboard: true
//             }
//         })
//         try {
//             const user = new tgUser({userId: id, username: username, startDate: startDate})
//             await user.save()
//         } catch (e) {
//             await errorMessage(e)
//         }
//         currentAction = 'setContact'
//         return;
//     }
//     if (candidate.promo === '') {
//         await bot.sendMessage(id, `Приветствую вас, ${msg.chat.first_name}\nОтправьте контакт, и зарегистрируйтесь в системе, для получения промокодов и прочих плюшек`, {
//             reply_markup: {
//                 keyboard: [
//                     [{text: 'Отправить контакт', callback_data: 'contact', request_contact: true}]
//                 ], one_time_keyboard: true
//             }
//         })
//         currentAction = 'setContact'
//         return;
//     }
//     currentAction = 'done'
//     await bot.sendMessage(id, `Вы уже зарегистрированы, как: "${candidate.name}"\nВаш промокод: ${candidate.promo}`)
//     return bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
// })
//
// bot.onText(/\/info/, async msg => {
//     const {id, username} = msg.chat
//     await tgUser.find().then(async allUsers => {
//         try {
//             const users = allUsers.map((f) => {
//                 const userPhone = f.phone ? f.phone.substring(f.phone.length - 7) : ''
//                 const userPhoneCode = f.phone ? f.phone.substr(0, f.phone.length - 7) : ''
//                 return `${f.name};${f.username ?  `${f.username}` : ''};${f.phone[0] === '+' ? `(${userPhoneCode}) ${userPhone}` : `(+${userPhoneCode}) ${userPhone}`};${f.birthDate};${f.promo};${f.startDate};${f.regDate}`
//             }).join('\n')
//
//             const buf = iconv.encode(users, 'win1251')
//
//             await fs.writeFile("./files/users.csv", buf,{}, (err) => {
//                 if (err) console.log(err)
//             })
//             currentAction = 'info'
//             await bot.sendMessage(id, "Информация по пользователям")
//             await bot.sendDocument(id, './files/users.csv')
//         } catch (e) {
//             await errorMessage(e)
//         }
//     })
//     currentAction = 'info'
//     return console.log(`${id} - @${username} запросил информацию по пользователям`)
// })
//
// // bot.onText(/\/promo/, async msg => {
// //     const {id} = msg.chat
// //     const candidate = await tgUser.findOne({userId: id})
// //     if (!candidate || candidate.promo === '') {
// //         await bot.sendMessage(id, `Вы ещё не регистрировались, пройдите регистрацию`)
// //         currentAction = 'setContact'
// //         return bot.sendMessage(id, `Приветствую вас, ${msg.chat.first_name}\nОтправьте контакт, и зарегистрируйтесь в системе, для получения промокодов и прочих плюшек`, {
// //             reply_markup: {
// //                 keyboard: [
// //                     [{text: 'Отправить контакт', callback_data: 'contact', request_contact: true}]
// //                 ], one_time_keyboard: true
// //             }
// //         })
// //     }
// //     await bot.sendMessage(id, `Ваш промокод: ${candidate.promo}`)
// //     return bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
// // })
//
// bot.onText(/\/codes/, async msg => {
//     const {id, username} = msg.chat
//     try {
//         await tgUser.find().then(async allUsers => {
//             const promos = allUsers.map((f,i) => {
//                 return `${i + 1}. ${f.promo}`
//             }).join('\n')
//             currentAction = 'codes'
//             await bot.sendMessage(id, promos)
//         })
//         return console.log(`${id} - @${username} запросил информацию по промокодам`)
//     } catch (e) {
//         await errorMessage(e)
//     }
// })
//
// bot.on('text', async msg => {
//     const {id} = msg.chat
//     const text = msg.text
//     const uuid = _ => 'x0x0x0x0x0'.replace(/x|0/g, v => v === 'x'
//         ? String.fromCharCode(Math.floor(Math.random() * 26) + 97).toUpperCase()
//         : Math.floor(Math.random() * 10)).toUpperCase()
//     const promocode1 = uuid()
//     const promocode = `BUZZ_${promocode1}`
//     const candidate = await tgUser.findOne({userId: id})
//     switch (currentAction) {
//         case 'setName' :
//             if (candidate.name) {
//                 currentAction = 'setBirthDay'
//                 return bot.sendMessage(id, `Вы уже зарегестрированы как: "${candidate.name}"\nТеперь введите вашу дату рождения в формате 'дд.мм.гггг'`)
//             }
//             try {
//                 await tgUser.findOneAndUpdate({userId: id}, {name: text})
//             } catch (e) {
//                 await errorMessage(e)
//             }
//             currentAction = 'setBirthDay'
//             return bot.sendMessage(id, `Ваше ФИО успешно записано\nТеперь введите вашу дату рождения в формате 'дд.мм.гггг'`)
//         case 'setBirthDay' :
//             if (candidate.birthDate) {
//                 currentAction = 'done'
//                 return bot.sendMessage(id, `Вы уже полностью зарегистрированы, ${candidate.name}\nВаш промокод: ${candidate.promo}`)
//             }
//             const now = new Date()
//             const regDate = moment(now).locale('ru').format('lll')
//             try {
//                 await tgUser.findOneAndUpdate({userId: id}, {birthDate: text, promo: promocode, regDate: regDate})
//             } catch (e) {
//                 errorMessage(e)
//             }
//             console.log(`${candidate.name} зарегистрирован(а) с промокодом: ${promocode}`)
//             await bot.sendMessage(groupId, `${candidate.name} зарегистрирован(а) с промокодом: ${promocode}`)
//             currentAction = 'done'
//             await bot.sendMessage(id, `Поздравляем, ты успешно зарегистрировался.\nЛови свой первый промокод на 10 000 сум: ${promocode}`, {
//                 reply_markup: {
//                     keyboard: [
//                         [{text: 'Мой промокод'}]
//                     ]
//                 }
//             })
//             return bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
//         case 'info' :
//             break
//         case '' :
//             break
//     }
//     if (text === 'Мой промокод') {
//         if (!candidate || candidate.promo === '') {
//             await bot.sendMessage(id, `Вы ещё не регистрировались, пройдите регистрацию`)
//             currentAction = 'setContact'
//             return bot.sendMessage(id, `Приветствую вас, ${msg.chat.first_name}\nОтправьте контакт, и зарегистрируйтесь в системе, для получения промокодов и прочих плюшек`, {
//                 reply_markup: {
//                     keyboard: [
//                         [{text: 'Отправить контакт', callback_data: 'contact', request_contact: true}]
//                     ], one_time_keyboard: true
//                 }
//             })
//         }
//         await bot.sendMessage(id, `Ваш промокод: ${candidate.promo}`)
//         return bot.sendMessage(id, `Чтобы получить дополнительные 10 000 сум переходи по ссылке и скачивай приложение UDS\nhttps://buzzuz.uds.app/c/certificates/receive?token=efc51fb53c6a5d07a88d52d6726f36ed53d1644cc9aa5c2fc4023726346bfe09`)
//     }
// })
//
// bot.on('contact', async msg => {
//     const {id} = msg.chat
//     const contact = msg.contact.phone_number
//     if(currentAction !== 'setContact') return
//     try {
//         const candidate = await tgUser.findOne({phone: msg.contact.phone_number})
//         if (candidate) {
//             currentAction = 'setName'
//             await tgUser.findOneAndUpdate({userId: id}, {phone: contact})
//             return bot.sendMessage(id,`Контакт уже зарегестрирован\nТеперь введи свои ФИО`)
//         }
//         await tgUser.findOneAndUpdate({userId: id}, {phone: contact})
//         currentAction = 'setName'
//         return bot.sendMessage(id, `Контакт успешно зарегистрирован\nТеперь введи свои ФИО`)
//     } catch (e) {
//         await errorMessage(e)
//     }
// })



// TODO
// Добавить к промокодам BUZZ_ в начале