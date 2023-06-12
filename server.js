const express = require('express')
const app = express()
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override')
const {MongoClient, ObjectId} = require('mongodb')
const UserModel = require('./models/userModel')
const { ObjectID } = require('bson')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

const initializePassport = require('./passport-config');

var dotenv = require('dotenv').config()
var url = process.env.MONGOLAB_URL

// initializePassport(
//     passport, 
//     //async email => await client.db("QCC-DB").collection("Profiles").find({email: user.email}), //CHECK DATABASE FOR EMAIL
//     //id => users.find(user => user.id === id) //CHECK DATABASE FOR EMAIL
// );

app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }))
app.use(methodOverride('_method'))

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

//Index route
app.get('/', async (req, res) => {
    try {
        const client = new MongoClient(url)

        const articles = await client.db("QCC-DB").collection("Articles").find().limit(12).sort({createdAt: -1}).toArray();
    
        res.render('articles/index', { articles: articles })

        await client.close()
    } catch (e) {
        console.error(e)
    }
})

//Login route
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('admin/login')
});

//Login redirection
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/admin/login',
    failureFlash: true
}))

//Register route
app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('admin/register')
})

//Register redirection
app.post('/register', async (req, res) => {
    try {
        const client = new MongoClient(url)

        var newUser = new UserModel({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name
        });

        newUser.save(function(err) { if (err) throw err})

        await client.db("QCC-DB").collection("Profiles").insertOne(newUser);

        await client.close()
    } catch (e) {
        res.redirect('/register')
    } finally {
        res.render('admin/login')
    }
})

//Panthers Route
app.get('/Panthers', async(req, res) => {
    try {
        const client = new MongoClient(url)

        const articles = await client.db("QCC-DB").collection("Articles").find({category: "Panthers"}).sort({createdAt: -1}).toArray();

        res.render('articles/Panthers', { articles: articles })

        await client.close()
    } catch (e) {
        console.error(e)
    }
});

//Hornets Route
app.get('/Hornets', async(req, res) => {
    try {
        const client = new MongoClient(url)

        const articles = await client.db("QCC-DB").collection("Articles").find({category: "Hornets"}).sort({createdAt: -1}).toArray();

        res.render('articles/Hornets', { articles: articles })

        await client.close()
    } catch (e) {
        console.error(e)
    }
});

//Charlotte FC Route
app.get('/CharlotteFC', async(req, res) => {
    try {
        const client = new MongoClient(url)

        const articles = await client.db("QCC-DB").collection("Articles").find({category: "CharlotteFC"}).sort({createdAt: -1}).toArray();

        res.render('articles/CharlotteFC', { articles: articles })

        await client.close()
    } catch (e) {
        console.error(e)
    }
});

//Admin route, must be authenticated to access
app.get('/adminArticles', async (req, res) => {
    try {
        const client = new MongoClient(url)

        const articles = await client.db("QCC-DB").collection("Articles").find().sort({createdAt: -1}).toArray();

        res.render('admin/adminArticles', {articles: articles})

        await client.close()
    } catch (e) {
        console.error(e)
    }
})

//New (or Edit) Article route, must be authenticated to access
app.get('/new', async (req, res) => {
    try {
        res.render('admin/new')
    } catch (e) {
        console.error(e)
    }
})

app.get('/edit/:id', async (req, res) => 
{
    try {
        const client = new MongoClient(url)

        const article = await client.db("QCC-DB").collection("Articles").findOne({_id: ObjectID(req.params.id.trim())});

        if (article == null) { res.redirect('/admin/adminArticles') }

        res.render('admin/edit', {article: article})
        
        await client.close();
    } catch (e) {
        console.error(e)
    }
})

//Checks for authentication
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    } res.redirect('/login')
}

//Checks if user is not logged in
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    } next()
}

app.use('/articles', articleRouter)

app.use((req, res, next) => {
    res.status(404).send("Error 404: Page Not Found")
})

app.listen(5500);