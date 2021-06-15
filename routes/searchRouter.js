const express = require('express')
const app = express()
const router = express.Router()
const User = require('../schemas/UserSchema')
const bcrypt = require('bcrypt')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get('/', (req,res)=>{
    const payload = createPayload(req.session.user)

    res.render('searchPage',payload)
})
router.get('/:selectedTab', (req,res)=>{
    const payload = createPayload(req.session.user)
    payload.selectedTab = req.params.selectedTab
    res.render('searchPage',payload)
})

function createPayload(userLoggedIn){
    return {
        pageTitle: 'Search',
        userLoggedIn: userLoggedIn,
        userLoggedInJs: JSON.stringify(userLoggedIn),
        profileUserJs: JSON.stringify(userLoggedIn),
    }
}
module.exports = router