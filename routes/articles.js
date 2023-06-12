const express = require('express')
const Article = require('./../models/article')
const { MongoClient } = require('mongodb')
const { ObjectID } = require('bson')
const slugify = require('slugify')
const marked = require('marked')
const createDomPurifier = require('dompurify')
const { JSDOM } = require('jsdom')
const dompurify = createDomPurifier(new JSDOM().window)
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
    try {
        const client = new MongoClient(url)

        let newObjectId
        if (req.body._id == null) { newObjectId = new ObjectID() }
        else {newObjectId = ObjectID(req.body._id)}

        await client.db("QCC-DB").collection("Articles").replaceOne(
            {_id: newObjectId},
            {
                _id: newObjectId,
                title: req.body.title,
                description: req.body.description,
                markdown: req.body.markdown,
                createdAt: Date(req.body.createdAt),
                updatedAt: Date(req.body.updatedAt),
                tags: req.body['tags[]'],
                author: req.body.author,
                category: req.body.category,
                published: req.body.truefalse,
                slug: slugify(req.body.title, { lower: true, strict: true }),
                sanitizedHtml: dompurify.sanitize(marked.parse(req.body.markdown), { ADD_TAGS: ["iframe"], ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'] })
            }, 
            {upsert: true}
        )

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