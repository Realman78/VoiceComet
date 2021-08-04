const express = require('express')
const app = express()
const router = express.Router()
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema')
const Chat = require('../../schemas/ChatSchema')
const Message = require('../../schemas/MessageSchema')
const Notification = require('../../schemas/NotificationSchema')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get('/', async (req,res)=>{
    var searchObj = {userTo: req.session.user._id, notificationType: {$ne: "newMessage"}}
    if (req.query.unreadOnly !== undefined && req.query.unreadOnly == "true"){
        searchObj.opened = false
    }
    Notification.find(searchObj)
    .populate("userTo")
    .populate("userFrom")
    .sort({createdAt: -1})
    .then(results=> res.send(results))
    .catch(err =>{
        console.log(err)
        res.sendStatus(400)
    })
})
router.get('/latest', async (req,res)=>{
    Notification.findOne({userTo: req.session.user._id})
    .populate("userTo")
    .populate("userFrom")
    .sort({createdAt: -1})
    .then(results=> res.send(results))
    .catch(err =>{
        console.log(err)
        res.sendStatus(400)
    })
})
router.put('/:id/markAsOpened', async (req,res)=>{
    Notification.findByIdAndUpdate(req.params.id, {opened: true})
    .then(results=> res.sendStatus(204))
    .catch(err =>{
        console.log(err)
        res.sendStatus(400)
    })
})
router.put('/markAsOpened', async (req,res)=>{
    Notification.updateMany({userTo: req.session.user._id}, {opened: true})
    .then(()=> res.sendStatus(204))
    .catch(err =>{
        console.log(err)
        res.sendStatus(400)
    })
})


module.exports = router