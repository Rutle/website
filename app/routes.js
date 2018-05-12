'use strict'

// Function for getting breadcrumbs of the page
function getBreadcrumbs(req, res, next) {
	const urls = req.originalUrl.split('/');
	urls.shift();
	req.breadcrumbs = urls.map((url, i) => {
		return {
			breadcrumbName: (url === '' ? 'Home' : url.charAt(0).toUpperCase() + url.slice(1)),
			breadcrumbUrl: `/${urls.slice(0, i + 1).join('/')}`,
		};
	});
	next();
}

module.exports = function(app) {

	/**
	 * Main page.
	 */
  app.get('/', getBreadcrumbs, function(req, res) { // '/' url it is listening
	console.log(req.breadcrumbs.length);
  	res.render('home', {
		  breadcrumbs: req.breadcrumbs
	  });
	});
	
	/**
	 * Contact page.
	 */
  app.get('/contact', getBreadcrumbs, (req, res) => {
  	res.render('contact', {
			breadcrumbs: req.breadcrumbs
		});
	});
	
	/**
	 * Projects page.
	 */
  app.get('/projects', getBreadcrumbs, (req, res) => {
  	res.render('projects', {
			breadcrumbs: req.breadcrumbs
		});
	});
	
	/**
	 * About page.
	 */
  app.get('/about', getBreadcrumbs, function(req, res) {
		console.log(req.breadcrumbs);
    res.render('about', {
			breadcrumbs: req.breadcrumbs
		});
	});

	/**
	 * Ohjelmallinen Sisällönhallinta project route.
	 */
  app.get('/projects/ohsiha', getBreadcrumbs, function(req, res) {
	  console.log(req.breadcrumbs);
		res.render('project', {
			breadcrumbs: req.breadcrumbs,
			projectName: 'Ohjelmallinen Sisällönhallinta',
			repo: 'ohsiha-website'
		});
	});
	
	/**
	 * Roguelike game route.
	 */
  app.get('/projects/roguelike', getBreadcrumbs, function(req, res) {
		console.log(req.breadcrumbs);
	  res.render('project', {
			breadcrumbs: req.breadcrumbs,
			projectName: 'Roguelike',
			repo: ''
	  });
	});
	
	/**
	 * Johdanto Datatieteeseen project route.
	 */
  app.get('/projects/jodatut', getBreadcrumbs, function(req, res) {
		console.log(req.breadcrumbs);
	  res.render('project', {
			breadcrumbs: req.breadcrumbs,
			projectName: 'Johdanto Datatieteeseen',
			repo: 'jodatut-ht'
	  });
	});

	/**
	 * Website project route.
	 */
  app.get('/projects/website', getBreadcrumbs, function(req, res) {
	  console.log(req.breadcrumbs);
	  res.render('project', {
			breadcrumbs: req.breadcrumbs,
			projectName: 'Personal website',
			repo: 'website'
	  });
	});

	/**
	 * Price scraper project route.
	 */
  app.get('/projects/scraper', getBreadcrumbs, function(req, res) {
		console.log(req.breadcrumbs);
	  res.render('project', {
			breadcrumbs: req.breadcrumbs,
			projectName: 'Sale price scraper',
			repo: ''
	  });
	});

	/**
	 * Twitch application project route.
	 */
  app.get('/projects/twitch', getBreadcrumbs, function(req, res) {
		console.log(req.breadcrumbs);
	  res.render('project', {
			breadcrumbs: req.breadcrumbs,
			projectName: 'Twitch stream application',
			repo: 'twitch-program'
	  });
	});
	/**
	 * Renders 404 page when a page cannot be found.
	 */
  app.use(function (req, res, next) {
		res.status(404).render('404', {
			breadcrumbs: [{breadcrumbName: "404", breadcrumbUrl: "/"}]
		});
  })
}
