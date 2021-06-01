const express = require('express')
const app = express()
const router = express.Router()
const User = require('../schemas/UserSchema')
const bcrypt = require('bcrypt')

app.set("view engine", "hbs")
app.set("views", "views")

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get('/:id', (req,res)=>{

    const payload = {
        pageTitle: 'View post',
        postId: req.params.id,
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }

    res.render('postPage',payload)
})



module.exports = router