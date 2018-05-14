// index.js

'use strict';

require('dotenv').config()

const path          = require('path');
var morgan          = require('morgan');
var mongoose        = require('mongoose');
var helpers         = require('handlebars-helpers')(['comparison', 'array']);
const publicPath    = path.join(__dirname, '/views');
const express       = require('express');
const exphbs        = require('express-handlebars');
var session         = require('express-session');
const PORT          = process.env.PORT || 5000;

// Connection to database.
// Here we find an appropriate database to connect to, defaulting to
// localhost if we don't find one.
var uristring = process.env.MONGODB_URI || 'mongodb://localhost/personalwebsite';
mongoose.connect(uristring, function (err, res) {
	if (err) {
		console.log('ERROR connecting to: ' + uristring + '. ' + err);
	} else {
		console.log ('Succeeded connected to: ' + uristring);
	}
});

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
app.use(session({
	secret: "It's a secret!",
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false}
	})
);



require('./app/routes')(app);

app.listen(PORT, () => console.log('Listening on %d', PORT));
