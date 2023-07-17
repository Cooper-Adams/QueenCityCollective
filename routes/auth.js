const express = require('express')
const passport = require('passport')
const router = express.Router()
const bcrypt = require('bcrypt')
const { MongoClient } = require('mongodb')
const UserModel = require('./../models/userModel')
const methodOverride = require('method-override')

router.use(methodOverride('_method'))

router.get('/log-reg', checkNotAuthenticated, (req, res) => {
    res.render('admin/log-reg', {user: new UserModel()})
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