const express = require('express')
const app = express()
const path = require('path')
require('./database')
const {requestLogin} = require('./middleware')
var session = require('express-session')

const port = process.env.PORT || 3000
const server = app.listen(port, ()=>{
    console.log(`Server is listening on port ${port}`)
})
const io = require('socket.io')(server, {pingTimeout: 60000})

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
const notificationsRoute = require('./routes/notificationsRoute')
app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/posts',requestLogin, postRoute)
app.use('/profile',requestLogin, profileRouter)
app.use('/search',requestLogin, searchRouter)
app.use('/messages',requestLogin, messagesRouter)
app.use('/logout', logoutRoute)
app.use('/notifications', requestLogin, notificationsRoute)
//Api routes
const postApiRoute = require('./routes/api/posts')
const userApiRoute = require('./routes/api/users')
const chatsApiRoute = require('./routes/api/chats')
const messagesApiRoute = require('./routes/api/messages')
const notificationsApiRoute = require('./routes/api/notifications')
app.use('/api/posts', postApiRoute)
app.use('/api/users', userApiRoute)
app.use('/api/chats', chatsApiRoute)
app.use('/api/messages', messagesApiRoute)
app.use('/api/notifications', notificationsApiRoute)


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

io.on('connection', (socket) =>{
    socket.on("setup", userData=>{
        socket.join(userData._id)
        socket.emit('connected')
    })
    socket.on("join room", room=>{
        socket.join(room)
    })
    socket.on("typing", room=>{
        socket.in(room).emit("typing")
    })
    socket.on("stop typing", room=>{
        socket.in(room).emit("stop typing")
    })
    socket.on("notification received", room=>{
        socket.in(room).emit("notification received")
    })
    socket.on("new message", newMessage=>{
        var chat = newMessage.chat
        if (!chat.users) return console.log('user not defined')
        chat.users.forEach(user=>{
            if (user._id == newMessage.sender._id) return
            socket.in(user._id).emit("message recieved", newMessage)
        })
    })
})