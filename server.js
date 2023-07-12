const express = require('express')
const Article = require('./models/article')
const app = express()
const articleRouter = require('./routes/articles')
const methodOverride = require('method-override')
const {MongoClient} = require('mongodb')
const UserModel = require('./models/userModel')
const { ObjectID } = require('bson')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const bcrypt = require('bcrypt')

const initializePassport = require('./passport-config');
initializePassport(
    passport, 
    async email => await new MongoClient(process.env.MONGOLAB_URL).db("QCC-DB").collection("Profiles").findOne({email: email}),
    async id => await new MongoClient(process.env.MONGOLAB_URL).db("QCC-DB").collection("Profiles").findOne({id: id})
)

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
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const articles = await client.db("QCC-DB").collection("Articles").find().limit(12).sort({createdAt: -1}).toArray();
        res.render('articles/index', { articles: articles, loggedIn: checkLoggedIn(req.user) })
    } catch (e) {
        console.error(e)
    }
})

app.get('/log-reg', checkNotAuthenticated, (req, res) => {
    res.render('admin/log-reg', {user: new UserModel()})
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-reg',
    failureFlash: true
}))

app.post('/register', async (req, res) => {
    const client = new MongoClient(process.env.MONGOLAB_URL)
    
    if (req.body.confirm != req.body.password) {
        req.flash('error', "Passwords do not match.")
    } else if (await client.db("QCC-DB").collection("Profiles").findOne({email: req.body.email})) {
        req.flash('error', "Email is already in use.")
    } else {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        var newUser = new UserModel({
            id: Date.now().toString(),
            email: req.body.email,
            password: hashedPassword,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        })

        try {
            await client.db("QCC-DB").collection("Profiles").insertOne(newUser)
        } catch (e) {
            console.error(e)
        }
    }
    
    await client.close()
    res.redirect('/log-reg')
})

app.post('/comment', async (req, res) => {
    const client = new MongoClient(process.env.MONGOLAB_URL)

    try {
        await client.db("QCC-DB").collection("Articles").findOneAndUpdate({ slug: req.body.slug }, {$push:{'comments':{'time': Date.now(), 'name': req.body.name, 'comment': req.body.comment}}})
        await client.close()
        
        res.redirect('articles/' + req.body.slug)
    } catch (e) {
        console.error(e)
    }
})

app.get('/Panthers', async(req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const articles = await client.db("QCC-DB").collection("Articles").find({category: "Panthers"}).sort({createdAt: -1}).toArray();
        res.render('articles/Panthers', { articles: articles, loggedIn: checkLoggedIn(req.user) })
    } catch (e) {
        console.error(e)
    } finally { await client.close() }
})

app.get('/Hornets', async(req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const articles = await client.db("QCC-DB").collection("Articles").find({category: "Hornets"}).sort({createdAt: -1}).toArray();
        res.render('articles/Hornets', { articles: articles, loggedIn: checkLoggedIn(req.user) })
        await client.close()
    } catch (e) {
        console.error(e)
    }
})

app.get('/CharlotteFC', async(req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const articles = await client.db("QCC-DB").collection("Articles").find({category: "CharlotteFC"}).sort({createdAt: -1}).toArray();
        res.render('articles/CharlotteFC', { articles: articles, loggedIn: checkLoggedIn(req.user) })
        await client.close()
    } catch (e) {
        console.error(e)
    }
})

app.get('/adminArticles', checkAuthenticated, async (req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const articles = await client.db("QCC-DB").collection("Articles").find().sort({createdAt: -1}).toArray();
        res.render('admin/adminArticles', {articles: articles})
        await client.close()
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
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const article = await client.db("QCC-DB").collection("Articles").findOne({_id: ObjectID(req.params.id.trim())});
        if (article == null) { res.redirect('/adminArticles') }
        else { res.render('admin/edit', {article: article}) }
        await client.close()
    } catch (e) {
        console.error(e)
    }
})

app.get('/articles/:slug', async (req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const article = await client.db("QCC-DB").collection("Articles").findOne({ slug: req.params.slug });
        if (article == null) { res.redirect('/') }
        if (checkLoggedIn(req.user)) { res.render('articles/show', { article: article, loggedIn: true, name: (req.user.firstName + " " + req.user.lastName) }) }
        else { res.render('articles/show', { article: article, loggedIn: false }) }
        await client.close()
    } catch (e) {
        console.error(e)
    }
})

app.get('/auth/twitter', passport.authenticate('twitter', { scope: ['tweet.read', 'users.read', "offline.access"]}))

app.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { 
    failureRedirect: '/log-reg',
    failureFlash: true,
    successRedirect: "/"
}))

app.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err)
        } res.redirect('/log-reg')
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

function checkLoggedIn(user) {
    if (user != undefined) { return true }
    else { return false }
}

app.use('/articles', articleRouter)

app.use((req, res, next) => {
    res.status(404).send("Error 404: Page Not Found")
})

app.listen(5500);