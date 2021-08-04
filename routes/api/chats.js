const express = require('express')
const app = express()
const router = express.Router()
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema')
const Chat = require('../../schemas/ChatSchema')
const Message = require('../../schemas/MessageSchema')


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.post('/', async (req,res)=>{
    if (!req.body.users) {
        console.log('Users params not sent properly')
        return res.sendStatus(400)
    }
    var users = req.body.users
    if (users.length == 0) {
        console.log('Users array is empty')
        return res.sendStatus(400)
    }
    users.push(req.session.user)
    var chatData = {
        users,
        isGroupChat: true
    }
    const chat = await Chat.create(chatData).catch((e)=> console.log(e))
    res.send(chat)
})
router.get('/', async (req,res)=>{
    let chats = await Chat.find({users: { $elemMatch: {$eq: req.session.user._id} }})
    .populate("users")
    .populate("latestMessage")
    .sort({updatedAt: -1})
    .catch((e)=>console.log(e))
    if (req.query.unreadOnly !== undefined && req.query.unreadOnly == "true"){
        chats = chats.filter(r => r.latestMessage && !r.latestMessage.readBy.includes(req.session.user._id))
    }
    
    chats = await User.populate(chats, {path: "latestMessage.sender"})
    res.send(chats)
})
router.get('/:chatId', async (req,res)=>{
    const chats = await Chat.findOne({ _id: req.params.chatId,users: { $elemMatch: {$eq: req.session.user._id} }})
    .populate("users")
    .catch((e)=>console.log(e))
    res.send(chats)
})
router.put('/:chatId', async (req,res)=>{
    await Chat.findByIdAndUpdate(req.params.chatId, req.body)
    .catch((e)=>console.log(e))
    res.sendStatus(204)
})
router.get('/:chatId/messages', async (req,res)=>{
    const chats = await Message.find({chat: req.params.chatId})
    .populate("sender")
    .catch((e)=>console.log(e))
    res.send(chats)
})
router.put('/:chatId/messages/markAsRead', async (req,res)=>{
    await Message.updateMany({chat: req.params.chatId}, {$addToSet: {readBy: req.session.user._id}})
    .catch((e)=>console.log(e))
    res.sendStatus(204)
})
module.exports = router