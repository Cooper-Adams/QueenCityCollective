const express = require('express')
const passport = require('passport')
const router = express.Router()
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const { MongoClient } = require('mongodb')
const UserModel = require('./../models/userModel')
const Token = require('./../models/token')
const sendEmail = require("../utils/email/sendEmail")
const { error } = require('console')

router.get('/log-reg', checkNotAuthenticated, (req, res) => {
    res.render('admin/log-reg', {user: new UserModel()})
})

router.get('/forgot-password', checkNotAuthenticated, (req, res) => {
    res.render('admin/forgot-password')
})

router.post('/request-reset', checkNotAuthenticated, async (req, res) => {
    const client = new MongoClient(process.env.MONGOLAB_URL)
    const user = await client.db("QCC-DB").collection("Profiles").findOne({email: req.body.email})

    if (user == undefined || user == null)
    {
        req.flash('error', "Email Address not found.")
    } else {
        await client.db("QCC-DB").collection("Tokens").findOneAndDelete({userId: user.id})
        let resetToken = crypto.randomBytes(10).toString("hex")
        const hash = await bcrypt.hash(resetToken, 10)

        let newToken = new Token({
            userId: user.id,
            token: hash,
            createdAt: Date.now(),
        })

        await client.db("QCC-DB").collection("Tokens").insertOne(newToken)
        await client.db("QCC-DB").collection("Tokens").createIndex({createdAt: 1}, {expireAfterSeconds: 300})

        const link = `127.0.0.1:5500/passwordReset?token=${resetToken}&id=${user.id}`

        await sendEmail(user.email, "Password Reset Request", {name: user.firstName, link: link}, "./template/requestResetPassword.handlebars")
    }

    await client.close()
    res.redirect('/forgot-password')
})

router.get('/passwordReset', checkNotAuthenticated, async (req, res) => {
    const client = new MongoClient(process.env.MONGOLAB_URL)

    let dbToken = await client.db("QCC-DB").collection("Tokens").findOne({ userId: req.query.id })

    if (dbToken == undefined || dbToken == null || await bcrypt.compare(req.query.token, dbToken.token) == false)
    {
        req.flash('error', 'Password reset token is invalid or expired.')

        res.redirect('/log-reg')
    } else {
        res.render('admin/reset-password', {userId: req.query.id})
    }
})

router.post('/reset-password', checkNotAuthenticated, async (req, res) => {
    try {
        const client = new MongoClient(process.env.MONGOLAB_URL)
    
        const hash = await bcrypt.hash(req.body.password, 10)
    
        await client.db("QCC-DB").collection("Profiles").findOneAndUpdate({ id: req.body.id }, { "$set": { password: hash }})
        await client.db("QCC-DB").collection("Token").findOneAndDelete({ userId: req.body.id })
        await client.close()
    
        req.flash('error', "Password succesfully reset.")
    
        res.redirect('/log-reg')
    } catch (error) {
        console.error(error)
    }
})

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/log-reg',
    failureFlash: true
}))

router.post('/register', async (req, res) => {
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

router.delete('/logout', (req, res, next) => {
    req.logOut((err) => {
        if (err) {
            return next(err)
        } res.redirect('/log-reg')
    })
})

//Social Auth Routes
router.get('/auth/twitter', passport.authenticate('twitter', { scope: ['tweet.read', 'users.read', "offline.access"]}))

router.get('/auth/twitter/callback', 
  passport.authenticate('twitter', { 
    failureRedirect: '/log-reg',
    failureFlash: true,
    successRedirect: '/'
}))

router.get('/auth/google', passport.authenticate('google'))

router.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/log-reg',
    failureFlash: true
}))

router.get('/auth/facebook', passport.authenticate('facebook'))

router.get('/oauth2/redirect/facebook', passport.authenticate('facebook', { 
    failureRedirect: '/log-reg',
    failureFlash: true,
    successRedirect: '/'
}))

//"AUTH" Function
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    } next()
}

module.exports = router