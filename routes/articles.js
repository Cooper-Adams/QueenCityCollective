const express = require('express')
const router = express.Router()
const { MongoClient } = require('mongodb')

router.get('/', async (req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const articles = await client.db("QCC-DB").collection("Articles").find().limit(12).sort({createdAt: -1}).toArray()
        if (checkLoggedIn(req.user)) { res.render('articles/index', { articles: articles, loggedIn: true, role: req.user.role }) }
        else { res.render('articles/index', { articles: articles, loggedIn: false }) }
    } catch (e) {
        console.error(e)
    }
})

router.get('/Panthers', async(req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const articles = await client.db("QCC-DB").collection("Articles").find({category: "Panthers"}).sort({createdAt: -1}).toArray();
        res.render('articles/Panthers', { articles: articles, loggedIn: checkLoggedIn(req.user) })
        await client.close()
    } catch (e) {
        console.error(e)
    }
})

router.get('/Hornets', async(req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const articles = await client.db("QCC-DB").collection("Articles").find({category: "Hornets"}).sort({createdAt: -1}).toArray();
        res.render('articles/Hornets', { articles: articles, loggedIn: checkLoggedIn(req.user) })
        await client.close()
    } catch (e) {
        console.error(e)
    }
})

router.get('/CharlotteFC', async(req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const articles = await client.db("QCC-DB").collection("Articles").find({category: "CharlotteFC"}).sort({createdAt: -1}).toArray();
        res.render('articles/CharlotteFC', { articles: articles, loggedIn: checkLoggedIn(req.user) })
        await client.close()
    } catch (e) {
        console.error(e)
    }
})

router.get('/allarticles/:category/Page:number', async(req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
        let skipCount
        let articles
        let numDocs = await client.db("QCC-DB").collection("Articles").countDocuments()
        let pageCounter = Math.floor(numDocs / 2)
        
        if (req.params.number == 1) {
            skipCount = numDocs
        } else { 
            skipCount = 2 * (parseInt(req.params.number) - 1) 
        }

        if (req.params.category == 'ALL' || req.params.category == 'all') { 
            articles = await client.db("QCC-DB").collection("Articles").find().skip(numDocs - skipCount).limit(2).sort({createdAt: -1}).toArray()
        } else { 
            articles = await client.db("QCC-DB").collection("Articles").find({category: req.params.category}).find().skip(numDocs - skipCount).limit(2).sort({createdAt: -1}).toArray()
        }

        res.render('articles/AllArticles', { articles: articles, loggedIn: checkLoggedIn(req.user), category: req.params.category, pages: pageCounter, page: req.params.number})
        await client.close()
    } catch (e) {
        console.error(e)
    }
})

router.get('/articles/:slug', async (req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const article = await client.db("QCC-DB").collection("Articles").findOne({ slug: req.params.slug });
        if (article == null) { res.redirect('/') }
        if (checkLoggedIn(req.user)) {
            if (req.user.screenName) { res.render('articles/show', { article: article, loggedIn: true, name: (req.user.screenName)}) }
            else { res.render('articles/show', { article: article, loggedIn: true, name: (req.user.firstName + " " + req.user.lastName)}) } 
        }
        else { res.render('articles/show', { article: article, loggedIn: false }) }
        await client.close()
    } catch (e) {
        console.error(e)
    }
})

router.post('/comment', async (req, res) => {
    const client = new MongoClient(process.env.MONGOLAB_URL)

    try {
        await client.db("QCC-DB").collection("Articles").findOneAndUpdate({ slug: req.body.slug }, {$push:{'comments':{'time': Date.now(), 'name': req.body.name, 'comment': req.body.comment}}})
        await client.close()
        
        res.redirect('articles/' + req.body.slug)
    } catch (e) {
        console.error(e)
    }
})

function checkLoggedIn(user) {
    if (user) return true
    else return false
}

module.exports = router