const express = require('express')
const app = express()
const router = express.Router()
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema')
const multer = require('multer')
const fetch = require('node-fetch')

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


router.get('/', async (req,res)=>{
    res.send(await getPosts({}))
})

router.get('/:id', async (req,res)=>{
    const post = await Post.findById(req.params.id)
    res.send(post.audioFile)
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
    //const buffer = getBufferFromSite(req.body.audioFile)
    const postData = {
        content: req.body.content,
        postedBy: req.session.user,
        audioFile: req.body.audioFile
    }
    let post = await Post.create(postData).catch(e=>{console.log(e)})
    post = await User.populate(post, {path: "postedBy"})
    res.status(201).send(post)
})
async function getBufferFromSite(url){
    const res = await fetch(url)
    const data = await res.blob()
    const ab = await data.stream()
    const buffer = ab._readableState.buffer.head.data
    return buffer
}

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

async function getPosts(filter){
    return await Post.find(filter)
    .populate("postedBy")
    .sort({ "createdAt": -1 })
    .catch(error => console.log(error))
}


module.exports = router