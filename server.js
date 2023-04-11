const express = require('express')
const articleRouter = require('./routes/articles')
const {MongoClient} = require('mongodb')
const app = express()

var dotenv = require('dotenv').config()

var url = process.env.MONGOLAB_URL

app.set('view engine', 'ejs')

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
    const client = new MongoClient(url)

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

app.get('/Panthers', async(req, res) => {
    const client = new MongoClient(url)

    try {
        // Retrieves the 12 most recent articles from the database and passes them to the index
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
    const client = new MongoClient(url)

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
    const client = new MongoClient(url)

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

app.use('/articles', articleRouter)

app.use((req, res, next) => {
    res.status(404).send("Error 404: Content Not Found")
})

app.listen(5500);