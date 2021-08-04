const express = require('express')
const app = express()
const router = express.Router()
const User = require('../schemas/UserSchema')
const Chat = require('../schemas/ChatSchema')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get('/', (req,res)=>{
    const payload = {
        pageTitle: 'Notifications',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
        profileUser: req.session.user,
        profileUserJs: JSON.stringify(req.session.user)
    }

    res.render('notificationsPage',payload)
})


module.exports = router