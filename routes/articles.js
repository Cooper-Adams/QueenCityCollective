const express = require('express')
const Article = require('./../models/article')
const { MongoClient } = require('mongodb')
const { ObjectID } = require('bson')
const slugify = require('slugify')
const router = express.Router()

var dotenv = require('dotenv').config()
var url = process.env.MONGOLAB_URL

router.get('/:slug', async (req, res) => {
    const client = new MongoClient(url)

    const article = await client.db("QCC-DB").collection("Articles").findOne({ slug: req.params.slug });

    if (article == null) { res.redirect('/') }

    res.render('articles/show', {article: article})
        
    await client.close();
})

router.post('/', async (req, res) => {
    let article = new Article({
        title: req.body.title,
        description: req.body.description,
        markdown: req.body.markdown,
        createdAt: req.body.createdAt,
        updatedAt: req.body.updatedAt,
        tags: req.body['tags[]'],
        author: req.body.author,
        category: req.body.category,
        published: req.body.truefalse,
        slug: slugify(req.body.title, { lower: true, strict: true })
    })
    
    try {
        const client = new MongoClient(url)

        await client.db("QCC-DB").collection("Articles").insertOne(article);

        if (req.body.published) {
            res.render(`/articles/${article.slug}`)
        }

        else {
            const articles = await client.db("QCC-DB").collection("Articles").find().sort({createdAt: -1}).toArray();

            res.render('admin/adminArticles', { articles: articles })
        }

        await client.close()
    } catch (e) {
        console.error(e)
        res.render('articles/new', { article: article })
    }
})

router.delete('/:id', async (req, res) => {
    const client = new MongoClient(url)

    await client.db("QCC-DB").collection("Articles").findOneAndDelete({_id: ObjectID(req.params.id)})

    const articles = await client.db("QCC-DB").collection("Articles").find().sort({createdAt: -1}).toArray();

    res.render('admin/adminArticles', { articles: articles })

    await client.close()
})

module.exports = router