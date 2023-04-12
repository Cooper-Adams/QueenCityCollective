const express = require('express')
const Article = require('./../models/article')
const {MongoClient} = require('mongodb')
const { ObjectID } = require('bson')
const router = express.Router()

var dotenv = require('dotenv').config()

var url = process.env.MONGOLAB_URL

const client = new MongoClient(url)

router.get('/new', (req, res) => {
    res.render('articles/new', { article: new Article()})
})

router.get('/adminArticles', async (req, res) => {
    const articles = await client.db("QCC-DB").collection("Articles").find().sort({createdAt: -1}).toArray();

    res.render('articles/adminArticles', {articles: articles})
})

router.get('/:id', async (req, res) => 
{
    try {
        //Identifies the article in the database
        const article = await client.db("QCC-DB").collection("Articles").findOne({_id: ObjectID(req.params.id.trim())});

        //Redirects home if the article isn't found
        if (article == null)
        {
            res.redirect('/')
        }

        //Render the article if found
        res.render('articles/show', {article: article})
    } catch (e) {
        console.error(e)
    }
})

router.post('/', async (req, res) => {
    //Uses the article model to create a new savable article
    let article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
        tags: req.body.tags,
        author: req.body.author,
        image: req.body.image,
        category: req.body.category,
        published: req.body.published
    })
    
    try {
        //Posts article to database
        client.db("QCC-DB").collection("Articles").insertOne(article);

        //Redirects to new created article's page if save was succesful
        res.redirect(`/articles/${article._id}`)
    } catch (e) {
        //Passes article back if there is an error so fields can "auto-populate"
        console.error(e)
        res.render('articles/new', { article: article })
    }
})

module.exports = router