const bcrypt = require('bcrypt')
const passport  = require('passport')
const {MongoClient} = require('mongodb')
const UserModel = require('./models/userModel')
var dotenv = require('dotenv').config()

const LocalStrategy = require('passport-local').Strategy
const { Strategy } = require('@superfaceai/passport-twitter-oauth2');

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

        const currentUser = await client.db("QCC-DB").collection("Profiles").findOne({id: profile.id})

        if (!currentUser) {
            const hashedPassword = await bcrypt.hash(profile.id, 10)

            const newUser = new UserModel({
                id: profile.id,
                email: "DEFAULT",
                firstName: "TWITTER",
                lastName: "USER",
                screenName: profile.displayName,
                password: hashedPassword
            })

            await client.db("QCC-DB").collection("Profiles").insertOne(newUser)

            if (newUser) {
                return done(null, newUser)
            }
        }

        await client.close()

        return done(null, currentUser);
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