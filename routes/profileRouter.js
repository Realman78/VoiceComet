const express = require('express')
const app = express()
const router = express.Router()
const User = require('../schemas/UserSchema')
const bcrypt = require('bcrypt')

app.set("view engine", "hbs")
app.set("views", "views")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
router.get('/', (req,res)=>{

    const payload = {
        pageTitle: req.session.user.username,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user,
        profileUserJs: JSON.stringify(req.session.user)
    }

    res.render('profilePage',payload)
})
router.get('/:username', async (req,res)=>{

    const payload = await getPayload(req.params.username, req.session.user)

    res.render('profilePage',payload)
})

router.get('/:username/replies', async (req,res)=>{

    const payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = "replies"

    res.render('profilePage',payload)
})
router.get('/:username/following', async (req,res)=>{

    const payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = "following"

    res.render('followersAndFollowing',payload)
})
router.get('/:username/followers', async (req,res)=>{

    const payload = await getPayload(req.params.username, req.session.user)
    payload.selectedTab = "followers"

    res.render('followersAndFollowing',payload)
})
async function getPayload(username, userLoggedIn){
    var user = await User.findOne({username})
    if (user==null){
        user = await User.findById(username)
        if (user == null){
            return {
                pageTitle: 'User not found',
                userLoggedIn,
                userLoggedInJs: JSON.stringify(userLoggedIn),
            }
        }

    }
    return {
        pageTitle: user.username,
        userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUser: user,
        profileUserJs: JSON.stringify(user)
    }
}


module.exports = router