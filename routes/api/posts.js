const express = require('express')
const app = express()
const router = express.Router()
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema')
const Notification = require('../../schemas/NotificationSchema')
const multer = require('multer')
const fetch = require('node-fetch')
var cloudinary = require('cloudinary').v2
var txtomp3 = require("text-to-mp3");


cloudinary.config({ 
  cloud_name: 'dx4rhdmc6', 
  api_key: '711331614756127', 
  api_secret: 'QNjr1LlTdgaEzebOW-88M_FghJ8' 
});

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


router.get('/', async (req,res)=>{
    var searchObj = req.query
    if (searchObj.isReply !== undefined){
        var isReply = searchObj.isReply == "true"
        searchObj.replyTo = {$exists: isReply}
        delete searchObj.isReply
    }
    if (searchObj.search !== undefined){
        searchObj.content = {$regex: searchObj.search, $options: "i"}
        delete searchObj.search
    }
    if (searchObj.followingOnly !== undefined){
        var followingOnly = searchObj.followingOnly === "true"
        if (followingOnly){
            var objectIds = []
            if (!req.session.user.following){
                req.session.user.following = []
            }
            req.session.user.following.forEach(user=>{
                objectIds.push(user)
            })
            objectIds.push(req.session.user._id)
            searchObj.postedBy = {$in: objectIds}
        }

        delete searchObj.followingOnly
    }
    res.send(await getPosts(searchObj))
})

router.get('/:id', async (req,res)=>{
    var postData = await getPosts({_id: req.params.id})
    postData = postData[0]

    var results = {
        postData
    }
    if (postData.replyTo !== undefined){
        results.replyTo = postData.replyTo
    }
    results.replies = await getPosts({replyTo: req.params.id})
    res.send(results)
})


router.delete('/:id', async (req,res)=>{
    const post = await Post.findByIdAndDelete(req.params.id)
    await Post.deleteMany({shareData: post._id})
    if (post.audioID)
        await cloudinary.uploader.destroy(post.audioID, {resource_type: 'video'}, function(result,error) { console.log(error) });
    res.send(post)
})

const upload = multer({
    limits:{
        fileSize:1e8
    },
    fileFilter(req,file,cb){
        cb(undefined,true)
    }
})

router.post('/', upload.single('audioFile'),  async (req,res)=>{
    if (!req.body.content){
        return res.status(400).send()
    }
    let postData = {
        content: req.body.content,
        postedBy: req.session.user,
    }
    if (req.body.audioFile){
        const uploaded = await cloudinary.uploader.upload(req.body.audioFile, 
            {resource_type: 'video'},
        function(error, result) {
            if (error){
                console.log(error)
            }
        });
        postData.audioID = uploaded.public_id
        postData.audioFile = uploaded.url
    }
    if (req.body.replyTo){
        postData.replyTo = req.body.replyTo
    }
    
    let post = await Post.create(postData).catch(e=>{console.log(e)})
    post = await User.populate(post, {path: "postedBy"})
    post = await Post.populate(post, {path: "replyTo"})
    if (post.replyTo !== undefined){
        await Notification.insertNotification(post.replyTo.postedBy, req.session.user._id, "reply", post._id)
    }
    res.status(201).send(post)
})

router.post('/getbinary', (req,res)=>{
    if (!req.body.content) return res.status(400).send()
    txtomp3.attributes.tl = 'en'

    txtomp3.getMp3(req.body.content).then(function(binaryStream){
        res.send(binaryStream)
    }).catch(function(err){
    console.log("Error", err);
    });
})

router.put('/:id/like', async (req,res)=>{
    const postId = req.params.id
    const userId = req.session.user._id
    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId)
    var option = isLiked ? "$pull" : "$addToSet"
    req.session.user = await User.findByIdAndUpdate(userId,{[option]: {likes: postId}}, {new: true})
    .catch((err=>{
        console.log(err)
    }))

    const post = await Post.findByIdAndUpdate(postId,{[option]: {likes: userId}}, {new: true})
    .catch((err=>{
        console.log(err)
    }))
    if (!isLiked){
        await Notification.insertNotification(post.postedBy, req.session.user._id, "postLike", post._id)
    }
    res.status(200).send(post)
})

router.post('/:id/share', async (req,res)=>{
    const postId = req.params.id
    const userId = req.session.user._id
    
    //Try and delete retweet
    var deletedPost = await Post.findOneAndDelete({postedBy: userId, shareData: postId})
    .catch((err=>{
        console.log(err)
    }))

    var option = deletedPost != null ? "$pull" : "$addToSet"

    var repost = deletedPost;
    if (repost == null){
        repost = await Post.create({postedBy: userId, shareData: postId})
        .catch((err=>{
        console.log(err)
    }))
    }
    
    req.session.user = await User.findByIdAndUpdate(userId, { [option]: { sharedPosts: repost._id } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })

   
    var post = await Post.findByIdAndUpdate(postId, { [option]: { shareUsers: userId } }, { new: true })
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    })
    if (!deletedPost){
        await Notification.insertNotification(post.postedBy, req.session.user._id, "share", post._id)
    }

    res.status(200).send(post)
})
async function getPosts(filter) {
    var results = await Post.find(filter)
    .populate("postedBy")
    .populate("shareData")
    .populate("replyTo")
    .sort({ "createdAt": -1 })
    .catch(error => console.log(error))

    results = await User.populate(results, { path: "replyTo.postedBy"})
    return await User.populate(results, { path: "shareData.postedBy"});
}


module.exports = router