const express = require('express')
const app = express()
const router = express.Router()
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema')
const multer = require('multer')
const fetch = require('node-fetch')
var cloudinary = require('cloudinary').v2

cloudinary.config({ 
  cloud_name: 'dx4rhdmc6', 
  api_key: '711331614756127', 
  api_secret: 'QNjr1LlTdgaEzebOW-88M_FghJ8' 
});

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


router.get('/', async (req,res)=>{
    res.send(await getPosts({}))
})

router.delete('/:id', async (req,res)=>{
    const post = await Post.findByIdAndDelete(req.params.id)
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
    let postData = {}
    if (req.body.audioFile){
        const uploaded = await cloudinary.uploader.upload(req.body.audioFile, 
            {resource_type: 'video'},
        function(error, result) {
            if (error){
                console.log(error)
            }
        });
        postData = {
            content: req.body.content,
            postedBy: req.session.user,
            audioID: uploaded.public_id,
            audioFile: uploaded.url,
        }
    }else{
        postData = {
        content: req.body.content,
        postedBy: req.session.user,
        }
    }
    
    let post = await Post.create(postData).catch(e=>{console.log(e)})
    post = await User.populate(post, {path: "postedBy"})
    res.status(201).send(post)
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

    res.status(200).send(post)
})
async function getPosts(filter){
    var results = await Post.find(filter)
    .populate("postedBy")
    .populate("shareData")
    .sort({ "createdAt": -1 })
    .catch(error => console.log(error))

    return await User.populate(results, { path: "shareData.postedBy"});
}


module.exports = router