// index.js

'use strict';

require('dotenv').config()

const path = require('path');
var passport = require('passport')
var flash = require('connect-flash');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var helpers = require('handlebars-helpers')(['comparison', 'array', 'object']);
const publicPath = path.join(__dirname, '/views');
const express = require('express');
const exphbs = require('express-handlebars');
var session = require('express-session');
const PORT = process.env.PORT || 5000;

// Connection to database.
// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring = process.env.MONGODB_URI || 'mongodb://localhost/rulleweb';
mongoose.connect(uristring, function (err, res) {
    if (err) {
        console.log('ERROR connecting to: ' + uristring + '. ' + err);
    } else {
        console.log('Succeeded connected to: ' + uristring);
    }
});

var User = require('./app/models/user');
User.findOne({ 'local.username': process.env.ADMIN_USERNAME }, function (err, admin) {
    if (err) {
        throw err;
    }
    if (!admin) {
        console.log("No admin created yet.")
        var adminUser = new User();
        adminUser.local.username = process.env.ADMIN_USERNAME;
        adminUser.local.password = adminUser.genHash(process.env.ADMIN_PASSWORD);
        adminUser.local.firstName = process.env.ADMIN_FIRSTNAME;
        adminUser.local.lastName = process.env.ADMIN_LASTNAME
        adminUser.rights = 'admin';

        adminUser.save(function (err, admin) {
            if (err)
                throw err;
            console.log("Admin ", admin.local.username, "is saved.")
        });
    } else {
        console.log("Admin already exists.");
    }
});

require('./app/passport')(passport);

const app = express();

app.engine('.hbs', exphbs({
    defaultLayout: 'main3',
    extname: '.hbs',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: helpers,
    partialsDir: ['views/partials']
}));

app.set('view engine', '.hbs');
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/'));
app.use('/semantic', express.static(__dirname + '/semantic/'));
app.use('/axios', express.static(__dirname + '/node_modules/axios/dist/'));

app.use('/', express.static(publicPath));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // Adds additional information to request (req.cookie).
app.use(session({
    secret: "It's a secret!",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
})
);
app.use(bodyParser.json()); // Adds additional information to request (req.body).
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


require('./app/routes.js')(app, passport);

app.listen(PORT, () => console.log('Listening on %d', PORT));
