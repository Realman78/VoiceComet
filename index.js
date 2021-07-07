const express = require('express')
const app = express()
const path = require('path')
require('./database')
const {requestLogin} = require('./middleware')
var session = require('express-session')

const port = process.env.PORT || 3000

app.use(session({
  secret: 'heok',
  resave: true,
  saveUninitialized: false
}))
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))

const registerRouter = require('./routes/registerRouter')
const loginRouter = require('./routes/loginRouter')
const postRoute = require('./routes/postRouter')
const profileRouter = require('./routes/profileRouter')
const logoutRoute = require('./routes/logout')
const searchRouter = require('./routes/searchRouter')
const messagesRouter = require('./routes/messagesRouter')
app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/posts',requestLogin, postRoute)
app.use('/profile',requestLogin, profileRouter)
app.use('/search',requestLogin, searchRouter)
app.use('/messages',requestLogin, messagesRouter)
app.use('/logout', logoutRoute)
//Api routes
const postApiRoute = require('./routes/api/posts')
const userApiRoute = require('./routes/api/users')
const chatsApiRoute = require('./routes/api/chats')
const messagesApiRoute = require('./routes/api/messages')
app.use('/api/posts', postApiRoute)
app.use('/api/users', userApiRoute)
app.use('/api/chats', chatsApiRoute)
app.use('/api/messages', messagesApiRoute)


app.get('/', requestLogin, (req,res,next)=>{
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next()
}, (req, res)=>{
    const payload = {
        title: 'Home',
        loggedUser: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    }
    res.render('home', payload)
})




app.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`)
})