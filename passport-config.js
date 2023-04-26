const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)

        if (user == null) {//CHECK DATABASE?
            return done(null, false, {message: 'Email does not exist.'})
        }

        try {
            if (await bcrypt.compare(password, user.password /*CHECK DATABASE?*/)) {
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
    passport.deserializeUser((id, done) => done(null, getUserById(id)))
}

module.exports = initialize