const express = require('express')
const app = express()
const router = express.Router()
const User = require('../schemas/UserSchema')
const bcrypt = require('bcrypt')
const {returnToHomeIfLoggedIn} = require('../middleware')

app.set("view engine", "hbs")
app.set("views", "views")
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

router.get('/', returnToHomeIfLoggedIn, (req,res)=>{
    res.render('login')
})
router.post('/', async (req,res)=>{
    const username = req.body.username
    const password = req.body.password

    const payload = req.body

    if (username && password){
        const user = await User.findOne({
            $or: [{username}, {email: username}]
        })
        .catch((e)=>{
            console.log(e)
            payload.errorMessage = "Something went wrong"
            res.render('login', payload)
        })
        if (user){
            const result = await bcrypt.compare(password, user.password)
            if (result === true){
                req.session.user = user
                return res.redirect('/')
            }else{
            payload.errorMessage = 'Login credentials are incorrect'
            return res.render('login', payload)
            }
        }else{
            payload.errorMessage = 'Login credentials are incorrect'
            return res.render('login', payload)
        }
    }else{
        payload.errorMessage = 'Make sure all field have values'
        return res.render('login', payload)
    }
})
module.exports = router
