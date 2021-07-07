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
    if (!req.body.content || !req.body.chatId){
        console.log("Invalid data passed into request")
        return res.sendStatus(400)
    }

    var newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    }
    Message.create(newMessage).then(async (result)=>{
        result = await result.populate("sender").execPopulate()
        result = await result.populate("chat").execPopulate()
        Chat.findByIdAndUpdate(req.body.chatId, {latestMessage: result}).catch((e)=>console.log(e))


        res.status(201).send(result)
    }).catch((e)=>{
        console.log(e)
    })
})
module.exports = router