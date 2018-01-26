// index.js

'use strict';

const Game = require('./app/game');
const path = require('path');
const publicPath = path.join(__dirname, '/views');
const express = require('express');
const exphbs = require('express-handlebars');
var session = require('express-session');
const PORT = process.env.PORT || 5000;
//const redis = require('./redisconnection')

var gameSessions = new Map();

const app = express();

app.engine('.hbs', exphbs({
	defaultLayout: 'main',
	extname: '.hbs',
	layoutsDir: path.join(__dirname, 'views/layouts')
}));
app.set('view engine', '.hbs');
//app.set('views', path.join(__dirname, 'views'))

app.use('/wanakana', express.static(__dirname + '/node_modules/wanakana/lib/'));
app.use('/', express.static(publicPath));
app.use(session({
	secret: "It's a secret!",
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false}
	})
);

app.get('/', (req, res) => { // '/' url it is listening
  /*var { sessionID } = request;*/
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
	res.render('home');
});
app.get('/game/:gameId/:translateTo?', (req, res) => {
	console.log(req.params)
	if(req.params.translateTo === undefined) {
		res.render('game', {
			gameId: req.params.gameId,
			gameStart: false,
		})
	} else {
		res.render('game', {
			gameId: req.params.gameId,
			translateTo: req.params.translateTo,
			gameStart: true,
		})
	}

});
app.get('/contact', (req, res) => {
	res.render('contact');
});
app.get('/projects', (req, res) => {
	res.render('projects');
});
app.listen(PORT, () => console.log('Listening on %d', PORT));
