const functions = require('firebase-functions')
require('firebase/firestore')

const express = require('express')
const fetch = require('node-fetch')
const passport = require('passport')
const SteamStrategy = require('passport-steam').Strategy

const db = require('./firestore/init')
const steamKey = functions.config().steam.key

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Steam profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the SteamStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new SteamStrategy({
        returnURL: 'http://keeprocketleagueonsteam.com/auth/steam/return',
        realm: 'http://keeprocketleagueonsteam.com/',
        apiKey: steamKey
    },
    function(identifier, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // To keep the example simple, the user's Steam profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Steam account with a user record in your database,
            // and return that user instead.
            profile.identifier = identifier
            return done(null, profile)
        })
    }
))

const passportAuth = passport.authenticate('steam', { failureRedirect: '/' })
const goHome = (req, res) => { res.redirect('/') }

const app = express()
app.use(cors)
app.use(passport.initialize())

app.get('/timestamp', (req, res) => {
    res.send(`${Date.now()}`)
})

// GET /auth/steam
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Steam authentication will involve redirecting
//   the user to steamcommunity.com.  After authenticating, Steam will redirect the
//   user back to this application at /auth/steam/return
app.use('/auth/steam/login', passportAuth, goHome)

// GET /auth/steam/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.use('/auth/steam/return', passportAuth, async (req, res) => {
    const query = req.query
    const steamIdUrl = query['openid.identity'] // 'https://steamcommunity.com/openid/id/xxxxxxxxxxxxxxxxx'
    const steamId = steamIdUrl.substring(steamIdUrl.lastIndexOf('/') + 1)
    const collRef = db.collection('users')
    let displayName = ''

    const url = `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamKey}&steamids=${steamId}`
    const params = {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Accept': '*/*',
            'Content-Type': 'application/json'
        }
    }

    await fetch(url, params)
        .then(async response => {
            await response.json()
                .then(r => {
                    const playerInfo = r.response.players[0]
                    displayName = playerInfo.personaname
                })
        })
        .catch(e => { console.log('error fetching persona name', e) })

    try {
        await collRef.doc(steamId).set({ displayName: displayName, steamId: steamId })
        console.log('added steam user', steamId, displayName)
    } catch (e){
        console.log('error adding steam user', steamId, e)
    }

    res.redirect('/')
})

exports.app = functions.https.onRequest(app)