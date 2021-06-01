const express = require('express')
const app = express()
const router = express.Router()
const User = require('../schemas/UserSchema')
const bcrypt = require('bcrypt')


app.use(express.urlencoded({ extended: true }));
app.use(express.json());



router.get('/', async (req,res)=>{
    if (req.session){
        req.session.destroy(()=>{
            res.redirect('/login')
        })
    }
})



module.exports = router