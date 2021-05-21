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
app.use('/register', registerRouter)
app.use('/login', loginRouter)

//Api routes
const postApiRoute = require('./routes/api/posts')
app.use('/api/posts', postApiRoute)


app.get('/', requestLogin, (req, res)=>{
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