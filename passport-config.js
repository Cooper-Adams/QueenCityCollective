const bcrypt = require('bcrypt')
const passport  = require('passport')
const {MongoClient} = require('mongodb')
const UserModel = require('./models/userModel')
var dotenv = require('dotenv').config()

const FacebookStrategy = require('passport-facebook')
const GoogleStrategy = require('passport-google-oidc')
const LocalStrategy = require('passport-local').Strategy
const { Strategy } = require('@superfaceai/passport-twitter-oauth2')

//Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/oauth2/redirect/facebook`,
    Proxy: true
  },
  async function(accessToken, refreshToken, profile, cb) {
    const client = new MongoClient(process.env.MONGOLAB_URL)

    let currentUser = await client.db("QCC-DB").collection("Profiles").findOne({id: profile.id})

        if (!currentUser) {
            const hashedPassword = await bcrypt.hash(profile.id, 10)

            currentUser = new UserModel({
                id: profile.id,
                email: "DEFAULT",
                firstName: 'FACEBOOK',
                lastName: 'USER',
                screenName: profile.displayName,
                password: hashedPassword
            })

            await client.db("QCC-DB").collection("Profiles").insertOne(currentUser)

            if (currentUser) {
                return cb(null, currentUser)
            }
        }

        await client.close()

        return cb(null, currentUser)
  }
))      

//Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BASE_URL}/oauth2/redirect/google`,
    scope: [ 'profile' ],
  }, async (issuer, profile, done) => {
        const client = new MongoClient(process.env.MONGOLAB_URL)

        let currentUser = await client.db("QCC-DB").collection("Profiles").findOne({id: profile.id})

        if (!currentUser) {
            const hashedPassword = await bcrypt.hash(profile.id, 10)

            currentUser = new UserModel({
                id: profile.id,
                email: "DEFAULT",
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                screenName: profile.displayName,
                password: hashedPassword
            })

            await client.db("QCC-DB").collection("Profiles").insertOne(currentUser)

            if (currentUser) {
                return done(null, currentUser)
            }
        }

        await client.close()

        return done(null, currentUser)
}))

//Twitter Strategy
passport.use(
    new Strategy(
      {
        clientID: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        clientType: 'confidential',
        callbackURL: `${process.env.BASE_URL}/auth/twitter/callback`,
      },
      async (access_token_key, refreshToken, profile, done) => {
        const client = new MongoClient(process.env.MONGOLAB_URL)

        let currentUser = await client.db("QCC-DB").collection("Profiles").findOne({id: profile.id})

        if (!currentUser) {
            const hashedPassword = await bcrypt.hash(profile.id, 10)

            currentUser = new UserModel({
                id: profile.id,
                email: "DEFAULT",
                firstName: "TWITTER",
                lastName: "USER",
                screenName: profile.displayName,
                password: hashedPassword
            })

            await client.db("QCC-DB").collection("Profiles").insertOne(currentUser)

            if (currentUser) {
                return done(null, currentUser)
            }
        }

        await client.close()

        return done(null, currentUser)
      }
    )
)

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email)

        if (user == null) {
            return done(null, false, {message: 'Email does not exist.'})
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            }

            else {
                return done(null, false, {message: 'Incorrect password.'})
            }
        } catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async (id, done) => {
        return done(null, await getUserById(id))
    })
}

module.exports = initialize