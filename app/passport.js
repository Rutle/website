'use strict';
// app/passport.js

// Purpose of this file is to configure our Passport strategies.
// Passport is used for authenticating requests and strategies are used for
// different types of authentications such as OAuth, basic local username/password
// authentication or even OpenID.
// http://www.passportjs.org/docs/
// https://www.npmjs.com/package/passport
// Example: https://github.com/passport/express-4.x-local-example
// Done following this tutorial: https://scotch.io/tutorials/easy-node-authentication-setup-and-local


var LocalStrategy = require('passport-local').Strategy;
var User = require('../app/models/user');


module.exports = function (passport) {
    console.log('passport configuraatio');

    /**
     * serialize the user for the session
     */
    passport.serializeUser(function (user, done) {
        console.log("serializeUser called", user.id);
        done(null, user.id);
    });

    /**
     *  deserialize the user
     */
    passport.deserializeUser(function (id, done) {
        console.log("deserializeUser called", id);
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    // Signup locally without OAuth etc.
    // Add our own strategy into passport that is used when new user signups
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, username, password, done) {
            /*
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
            */
            process.nextTick(function () {
                User.findOne({ 'local.username': username }, function (err, user) {
                    if (err)
                        return done(err)

                    if (user) {
                        // User with given email already exists.
                        return done(null, false, req.flash('signupMessage', 'That username is already in use by another user.'));
                    } else {
                        // Create a new user. Not logged in.
                        var newUser = new User();
                        newUser.local.username = username;
                        // Use the model method genHash() to hash the password.
                        newUser.local.password = newUser.genHash(password);
                        //newUser.local.firstName = req.body.fname;
                        //newUser.local.lastName = req.body.lname;
                        // Add new user into MongoDB.
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });

        }));
    // Login locally without OAuth etc.
    // Add our own strategy into passport that is used when new user logs in.
    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    },
        function (req, username, password, done) {
            // Find a user with the same email address.
            User.findOne({ 'local.username': username }, function (err, user) {
                // if there are any errors, return the error before anything else
                if (err)
                    return done(err);
                // No such user.
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                // Wrong password.
                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                return done(null, user);
            });

        }));

};
