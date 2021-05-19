const express = require('express')
const app = express()
const router = express.Router()
const User = require('../../schemas/UserSchema')
const Post = require('../../schemas/PostSchema')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get('/', async (req,res)=>{
    res.send(await getPosts({}))
})

router.post('/', async (req,res)=>{

    if (!req.body.content){
        return res.status(400).send()
    }
    const postData = {
        content: req.body.content,
        postedBy: req.session.user
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

async function getPosts(filter){
    return await Post.find(filter)
    .populate("postedBy")
    .sort({ "createdAt": -1 })
    .catch(error => console.log(error))
}


module.exports = router