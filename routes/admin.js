const express = require('express')
const Article = require('./../models/article')
const { MongoClient } = require('mongodb')
const { ObjectID } = require('bson')
const slugify = require('slugify')
const marked = require('marked')
const createDomPurifier = require('dompurify')
const { JSDOM } = require('jsdom')
const article = require('./../models/article')
const dompurify = createDomPurifier(new JSDOM().window)
const router = express.Router()

var dotenv = require('dotenv').config()
const url = process.env.MONGOLAB_URL

router.post('/', async (req, res) => {    
    try {
        const client = new MongoClient(url)

        let newObjectId
        if (req.body._id == null) { newObjectId = new ObjectID() }
        else { newObjectId = ObjectID(req.body._id) }

        let article = new Article({
            _id: newObjectId,
            title: req.body.title,
            description: req.body.description,
            markdown: req.body.markdown,
            createdAt: req.body.createdAt,
            updatedAt: req.body.updatedAt,
            tags: req.body['tags[]'],
            author: req.body.author,
            category: req.body.category,
            published: req.body.truefalse,
            slug: slugify(req.body.title, { lower: true, strict: true }),
            sanitizedHtml: dompurify.sanitize(marked.parse(req.body.markdown), { ADD_TAGS: ["iframe"], ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'] })
        })

        await client.db("QCC-DB").collection("Articles").replaceOne(
            {_id: newObjectId},
            { _id: article._id, title: article.title, description: article.description, markdown: article.markdown, createdAt: article.createdAt, updatedAt: article.updatedAt, tags: article.tags, author: article.author, category: article.category, published: article.published, slug: article.slug, sanitizedHtml: article.sanitizedHtml}, 
            {upsert: true}
        )

        res.redirect('/adminArticles')

        await client.close()
    } catch (e) {
        console.error(e)
        res.render('admin/edit', { article: article })
    }
})

router.delete('/:id', async (req, res) => {
    const client = new MongoClient(url)
    await client.db("QCC-DB").collection("Articles").findOneAndDelete({_id: ObjectID(req.params.id)})
    res.redirect('/adminArticles')
})

router.get('/adminArticles', checkAuthenticated, async (req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
        const articles = await client.db("QCC-DB").collection("Articles").find().sort({createdAt: -1}).toArray();
        res.render('admin/adminArticles', {articles: articles})
        await client.close()
    } catch (e) {
        console.error(e)
    }
})

router.get('/edit/:id', checkAuthenticated, async (req, res) => 
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

router.get('/new', checkAuthenticated, async (req, res) => {
    try {
        res.render('admin/new', {article: new Article()})
    } catch (e) {
        console.error(e)
    }
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'ADMIN') {
        return next()
    } res.redirect('/log-reg')
}

module.exports = router