const express = require('express')
const app = express()
const articleRouter = require('./routes/articles')
const adminRouter = require('./routes/admin.js')
const authRouter = require('./routes/auth')
const { MongoClient } = require('mongodb')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

const initializePassport = require('./passport-config');
initializePassport(
    passport, 
    async email => await new MongoClient(process.env.MONGOLAB_URL).db("QCC-DB").collection("Profiles").findOne({email: email}),
    async id => await new MongoClient(process.env.MONGOLAB_URL).db("QCC-DB").collection("Profiles").findOne({id: id})
)

app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }))

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

//Handles Article routes
app.use('/', articleRouter)

//Handles Admin routes
app.use('/', adminRouter)

//Handles Authentication routes
app.use('/', authRouter)

app.use((req, res, next) => {
    res.status(404).send("Error 404: Page Not Found")
})

app.listen(5500)