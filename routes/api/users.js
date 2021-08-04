const express = require('express')
const app = express()
const router = express.Router()
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema')
const Notification = require('../../schemas/NotificationSchema')
const multer = require('multer')
const upload = multer({
    limits:{
        fileSize:1e8
    },
    fileFilter(req,file,cb){
        cb(undefined,true)
    }
})
var cloudinary = require('cloudinary').v2
cloudinary.config({ 
  cloud_name: 'dx4rhdmc6', 
  api_key: '711331614756127', 
  api_secret: 'QNjr1LlTdgaEzebOW-88M_FghJ8' 
});

router.get('/', async (req,res)=>{
    var searchObj = req.query

    if (req.query.search !== undefined){
        searchObj = {
            $or: [
                {firstName: {$regex: req.query.search, $options: "i"}},
                {lastName: {$regex: req.query.search, $options: "i"}},
                {username: {$regex: req.query.search, $options: "i"}},
            ]
        }
    }
    User.find(searchObj).then(results=>{
        res.send(results)
    }).catch((e)=>{
        console.log(e)
        res.sendStatus(400)
    })
})


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

router.put('/:userId/follow', async (req,res)=>{
    const userId = req.params.userId
    var user = await User.findById(userId)
    if (user == null) return res.sendStatus(404)

    var isFollowing = user.followers && user.followers.includes(req.session.user._id)
    var option = isFollowing ? "$pull" : "$addToSet"
    req.session.user = await User.findByIdAndUpdate(req.session.user._id,{ [option]: {following: userId}}, {new: true})
    .catch((err=>{
        console.log(err)
    }))
    User.findByIdAndUpdate(userId,{ [option]: {followers: req.session.user._id}})
    .catch((err=>{
        console.log(err)
    }))
    if (!isFollowing){
        await Notification.insertNotification(userId, req.session.user._id, "follow", req.session.user._id)
    }
    res.send(req.session.user)
})

router.get('/:userId/following', async (req,res)=>{
    const user = await User.findById(req.params.userId).populate("following")
    .catch(e => {
        console.log(e)
        res.sendStatus(400)
    })

    res.send(user)
})

router.get('/:userId/followers', async (req,res)=>{
    const user = await User.findById(req.params.userId).populate("followers")
    .catch(e => {
        console.log(e)
        res.sendStatus(400)
    })
    res.send(user)
})

router.post('/profilePicture', upload.single('croppedImage'),async (req,res)=>{
    if (!req.body) {
        console.log('No file uploaded')
        return res.sendStatus(400)
    }
    const uploaded = await cloudinary.uploader.upload(req.body.croppedImage, 
        function(error, result) {
            if (error){
                console.log(error)
            }
        });
    req.session.user = await User.findByIdAndUpdate(req.session.user._id, {profilePic:uploaded.url}, {new:true})
    return res.sendStatus(204)
    
})
router.post('/coverPhoto', upload.single('croppedImage'),async (req,res)=>{
    if (!req.body) {
        console.log('No file uploaded')
        return res.sendStatus(400)
    }
    const uploaded = await cloudinary.uploader.upload(req.body.croppedImage, 
        function(error, result) {
            if (error){
                console.log(error)
            }
        });
    req.session.user = await User.findByIdAndUpdate(req.session.user._id, {coverPhoto:uploaded.url}, {new:true})
    return res.sendStatus(204)
    
})
module.exports = router