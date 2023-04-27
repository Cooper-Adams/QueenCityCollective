const express = require('express')
const app = express()
const articleRouter = require('./routes/articles')
const {MongoClient, ObjectId} = require('mongodb')
const UserModel = require('./models/userModel')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

const initializePassport = require('./passport-config');
const { name } = require('ejs')

var dotenv = require('dotenv').config()

var url = process.env.MONGOLAB_URL

const client = new MongoClient(url)

initializePassport(
    passport, 
    async email => await client.db("QCC-DB").collection("Profiles").find({email: user.email}), //CHECK DATABASE FOR EMAIL
    id => users.find(user => user.id === id) //CHECK DATABASE FOR EMAIL
);

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

//Index route
app.get('/', async (req, res) => {
    try {
        // Retrieves the 12 most recent articles from the database and passes them to the index
        const articles = await client.db("QCC-DB").collection("Articles").find().limit(12).sort({createdAt: -1}).toArray();

        res.render('articles/index', { articles: articles })
    } 
    
    catch (e) {
        console.error(e)
    } 
    
    finally {
        await client.close()
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
        var newUser = new UserModel({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name
        });

        newUser.save(function(err) { if (err) throw err})

        await client.db("QCC-DB").collection("Profiles").insertOne(newUser);
    } 
    
    catch (e) {
        res.redirect('/register')
    }
    
    finally {
        await client.close()
        res.render('admin/login')
    }
})

//Panthers Route
app.get('/Panthers', async(req, res) => {
    try {
        //Retrieves the Panthers articles from the database
        const articles = await client.db("QCC-DB").collection("Articles").find({category: "Panthers"}).sort({createdAt: -1}).toArray();

        res.render('articles/Panthers', { articles: articles })
    } 
    
    catch (e) {
        console.error(e)
    } 
    
    finally {
        await client.close()
    }
});

//Hornets Route
app.get('/Hornets', async(req, res) => {
    try {
        const articles = await client.db("QCC-DB").collection("Articles").find({category: "Hornets"}).sort({createdAt: -1}).toArray();

        res.render('articles/Hornets', { articles: articles })
    } 
    
    catch (e) {
        console.error(e)
    } 
    
    finally {
        await client.close()
    }
});

//Charlotte FC Route
app.get('/CharlotteFC', async(req, res) => {
    try {
        const articles = await client.db("QCC-DB").collection("Articles").find({category: "CharlotteFC"}).sort({createdAt: -1}).toArray();

        res.render('articles/CharlotteFC', { articles: articles })
    } 
    
    catch (e) {
        console.error(e)
    } 
    
    finally {
        await client.close()
    }
});

//Admin route, must be authenticated to access
app.get('/adminArticles', checkAuthenticated, async (req, res) => {
    const articles = await client.db("QCC-DB").collection("Articles").find().sort({createdAt: -1}).toArray();

    res.render('articles/adminArticles', {articles: articles})
})

app.use('/articles', articleRouter)

app.use((req, res, next) => {
    res.status(404).send("Error 404: Content Not Found")
})

//Checks for authentication
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

//Checks if user is not logged in
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }

    next()
}

app.listen(5500);