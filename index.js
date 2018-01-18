// index.js

'use strict';

const Game = require('./app/game');
const path = require('path');
const publicPath = path.join(__dirname, '/views');
const express = require('express');
const exphbs = require('express-handlebars');
var session = require('express-session');
const PORT = process.env.PORT || 5000
var gameSessions = new Map();

const app = express();

app.engine('.hbs', exphbs({
	defaultLayout: 'main2',
	extname: '.hbs',
	layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', '.hbs');
//app.set('views', path.join(__dirname, 'views'))

app.use('/', express.static(publicPath));
app.use(session({
	secret: "It's a secret!",
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false}
	})
);

app.get('/', (request, response) => { // '/' url it is listening
  var { sessionID } = request;
	//if () {	}
	/*
	if(request.session.page_views){
		request.session.page_views++;
		//response.send("You visited the page " + request.session.page_views + " times")
	} else {
		request.session.page_views = 1;
		//response.send("Welcome to this page for the first time!")
	}
	console.log(request); */
	response.render('home');
});
app.get('/hiragana', (request, response) => { // '/' url it is listening

	response.render('hiragana', {
		hiragana: "hg",
		romanji: "rj"
	} )
});
app.listen(PORT, () => console.log('Listening on ${PORT}'));
