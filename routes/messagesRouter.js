const express = require('express')
const app = express()
const router = express.Router()
const User = require('../schemas/UserSchema')
const Chat = require('../schemas/ChatSchema')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

router.get('/', (req,res)=>{

    const payload = {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user,
        profileUserJs: JSON.stringify(req.session.user)
    }

    res.render('inboxPage',payload)
})

router.get('/new', (req,res)=>{

    const payload = {
        pageTitle: "New Message",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user,
        profileUserJs: JSON.stringify(req.session.user)
    }

    res.render('newMessage',payload)
})

router.get('/:chatId', async (req,res)=>{
    var userId = req.session.user._id
    var chatId = req.params.chatId
    var isValid = mongoose.isValidObjectId(chatId)
    const payload = {
        pageTitle: 'Chat',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUserJs: JSON.stringify(req.session.user)

    }
    if (!isValid) {
        payload.errorMessage = "Chat does not exist"
        return res.render('chatPage',payload)
    }
    var chat = await Chat.findOne({_id: chatId, users: {$elemMatch: { $eq: userId }}})
    .populate("users")
    if (!chat) {
        var userFound = await User.findById(chatId)
        if (userFound != null){
            chat = await getChatByUserId(userFound._id, userId)
        }
    }
    if (!chat){
        payload.errorMessage = "Chat does not exist"
    }else{
        payload.chat = JSON.stringify(chat),
        payload.chatName = chat.chatName,
        payload.chatId = chat._id
    }


    return res.render('chatPage',payload)
})

function getChatByUserId(userLoggedInId, otherUserId){
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2, 
            $all: [
                {$elemMatch: {$eq: mongoose.Types.ObjectId(userLoggedInId)}},
                {$elemMatch: {$eq: mongoose.Types.ObjectId(otherUserId)}}
            ]
        }
    },
    {
        $setOnInsert: {
            users: [userLoggedInId, otherUserId]
        }
    }, {
        new: true, 
        upsert: true
    })
    .populate("users")
}
module.exports = router