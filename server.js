const express = require('express')
const Article = require('./models/article')
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
initializePassport(
    passport, 
    async email => new MongoClient(url).db("QCC-DB").collection("Profiles").findOne({email: email}),
    async id => new MongoClient(url).db("QCC-DB").collection("Profiles").findOne({id: id})
);

var dotenv = require('dotenv').config()
var url = process.env.MONGOLAB_URL

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

app.get('/', async (req, res) => {
    try {
        const client = new MongoClient(url)

        const articles = await client.db("QCC-DB").collection("Articles").find().limit(12).sort({createdAt: -1}).toArray();
    
        res.render('articles/index', { articles: articles })
    } catch (e) {
        console.error(e)
    }
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('admin/login')
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('admin/register', {user: new UserModel()})
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const client = new MongoClient(url)

        var newUser = new UserModel({
            id: Date.now().toString(),
            email: req.body.email,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });

        newUser.save(function(err) { if (err) throw err})

        await client.db("QCC-DB").collection("Profiles").insertOne(newUser);
    } catch (e) {
        res.redirect('/register', {user: newUser})
    } finally {
        res.redirect('/login')
    }
})

app.get('/Panthers', async(req, res) => {
    try {
        const client = new MongoClient(url)

        const articles = await client.db("QCC-DB").collection("Articles").find({category: "Panthers"}).sort({createdAt: -1}).toArray();

        res.render('articles/Panthers', { articles: articles })
    } catch (e) {
        console.error(e)
    }
});

app.get('/Hornets', async(req, res) => {
    try {
        const client = new MongoClient(url)

        const articles = await client.db("QCC-DB").collection("Articles").find({category: "Hornets"}).sort({createdAt: -1}).toArray();

        res.render('articles/Hornets', { articles: articles })
    } catch (e) {
        console.error(e)
    }
});

app.get('/CharlotteFC', async(req, res) => {
    try {
        const client = new MongoClient(url)

        const articles = await client.db("QCC-DB").collection("Articles").find({category: "CharlotteFC"}).sort({createdAt: -1}).toArray();

        res.render('articles/CharlotteFC', { articles: articles })
    } catch (e) {
        console.error(e)
    }
});

app.get('/adminArticles', checkAuthenticated, async (req, res) => {
    try {
        const client = new MongoClient(url)

        const articles = await client.db("QCC-DB").collection("Articles").find().sort({createdAt: -1}).toArray();

        res.render('admin/adminArticles', {articles: articles})
    } catch (e) {
        console.error(e)
    }
})

app.get('/new', checkAuthenticated, async (req, res) => {
    try {
        res.render('admin/new', {article: new Article()})
    } catch (e) {
        console.error(e)
    }
})

app.get('/edit/:id', checkAuthenticated, async (req, res) => 
{
    try {
        const client = new MongoClient(url)

        const article = await client.db("QCC-DB").collection("Articles").findOne({_id: ObjectID(req.params.id.trim())});

        if (article == null) { res.redirect('/adminArticles') }

        res.render('admin/edit', {article: article})        
    } catch (e) {
        console.error(e)
    }
})

app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err)
        } res.redirect('/login')
    })
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'ADMIN') {
        return next()
    } res.redirect('/login')
}

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