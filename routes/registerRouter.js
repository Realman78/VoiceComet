const express = require('express')
const router = express.Router()
const User = require('../schemas/UserSchema')
const bcrypt = require('bcrypt')

router.get('/', (req,res)=>{
    res.render('register')
})
router.post('/', async (req,res)=>{
    const firstName = req.body.firstName.trim()
    const lastName = req.body.lastName.trim()
    const username = req.body.username.trim()
    const email = req.body.email.trim()
    const password = req.body.password

    const payload = req.body

    if (firstName && lastName && username && email && password){
        const user = await User.findOne({
            $or: [{username}, {email}]
        }).catch(e=>{console.log(e)})

        if (user === null){
            const newUserData = req.body
            newUserData.password = await bcrypt.hash(password, 10)
            const newUser = await User.create(newUserData)
            req.session.user = newUser
            return res.redirect('/')
        }else{
            //String.fromCodePoint je za emojie
            if (user.email == email){
                payload.errorMessage = String.fromCodePoint(0x2709) + String.fromCodePoint(0x274C) + ' E-Mail is already taken'
                return res.render('register', payload)
            }
            if (user.username == username){
                payload.errorMessage = String.fromCodePoint(0x274C) + ' Username is already taken'
                return res.render('register', payload)
            }
        }
    }else{
        payload.errorMessage = String.fromCodePoint(0x274C) + ' Please make sure all fields have values'
        return res.render('register', payload)
    }
})

module.exports = router
