'use strict'

var gha = require('./githubapi');
var Project = require('./models/project');
//var scraper = require('./projects/scrape.js');

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

// Check if user is logged in with a middleware
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

/**
 * 
 */
function isAdmin(req, res, next) {
    if(req.user.rights === 'admin') {
        return next();
    }
    res.redirect('/')
}

module.exports = function (app, passport) {

	/**
	 * Main page.
	 */
    app.get('/', getBreadcrumbs, function (req, res) { // '/' url it is listening
        console.log(req.breadcrumbs.length);
        res.render('home', {
            breadcrumbs: req.breadcrumbs,
            user: req.user,
        });
    });

	/**
	 * Projects page.
	 */
    app.get('/projects', getBreadcrumbs, function (req, res) {
        res.render('projects', {
            breadcrumbs: req.breadcrumbs,
            user: req.user,
        });
    });

	/**
	 * Ohjelmallinen Sisällönhallinta project route.
	 */
    app.get('/projects/ohsiha', getBreadcrumbs, function (req, res) {
        console.log(req.breadcrumbs);
        res.render('project', {
            breadcrumbs: req.breadcrumbs,
            projectName: 'Ohjelmallinen Sisällönhallinta',
            repo: 'ohsiha-website',
            user: req.user,
        });
    });

	/**
	 * Roguelike game route.
	 */
    app.get('/projects/roguelike', getBreadcrumbs, function (req, res) {
        console.log(req.breadcrumbs);
        res.render('project', {
            breadcrumbs: req.breadcrumbs,
            projectName: 'Roguelike',
            repo: '',
            user: req.user,
        });
    });

	/**
	 * Johdanto Datatieteeseen project route.
	 */
    app.get('/projects/jodatut', getBreadcrumbs, function (req, res) {
        console.log(req.breadcrumbs);
        res.render('project', {
            breadcrumbs: req.breadcrumbs,
            projectName: 'Johdanto Datatieteeseen',
            repo: 'jodatut-ht',
            user: req.user,
        });
    });

	/**
	 * Website project route.
	 */
    app.get('/projects/website', getBreadcrumbs, function (req, res) {
        console.log(req.breadcrumbs);
        res.render('project', {
            breadcrumbs: req.breadcrumbs,
            projectName: 'Personal website',
            repo: 'website',
            user: req.user,
        });
    });

    /**
     * 
     */
    app.get('/projects/website/scraper', getBreadcrumbs, function (req, res) {
        console.log(req.breadcrumbs);
        res.render('scraper', {
            breadcrumbs: req.breadcrumbs,
            projectName: 'Sale price scraper',
            repo: 'scraper',
            user: req.user,
        });
    });

	/**
	 * Price scraper project route.
	 */
    app.get('/projects/scraper', getBreadcrumbs, function (req, res) {
        console.log(req.breadcrumbs);
        res.render('scraper', {
            breadcrumbs: req.breadcrumbs,
            projectName: 'Sale price scraper',
            repo: 'Testi',
            user: req.user,
        });
    });

	/**
	 * Twitch application project route.
	 */
    app.get('/projects/twitch', getBreadcrumbs, function (req, res) {
        console.log(req.breadcrumbs);
        res.render('project', {
            breadcrumbs: req.breadcrumbs,
            projectName: 'Twitch stream application',
            repo: 'twitch-program',
            user: req.user,
        });
    });

    /**
     * Dashboard route.
     */
    app.get('/dashboard', isLoggedIn, getBreadcrumbs, function (req, res) {
        res.render('dashboard', {
            breadcrumbs: req.breadcrumbs,
            user: req.user,
        })

    });

    /**
     * Dropdown API for scraper project
     */
    app.get('/api/stores', function (req, res) {

        res.status(200).json({
            success: true,
            results: [
                {
                    name: 'Stores',
                    value: 'categoryNameStore',
                    text: 'Stores',
                    disabled: true
                },
                {
                    name: 'All',
                    value: 'storeAll',
                    text: 'All stores',
                    disabled: false
                },
                {
                    name: 'Jimms',
                    value: 'storeJimms',
                    text: 'Jimms',
                    disabled: false
                }
            ]
        });
    });

    /**
     * Dropdown API for main menu projects dropdown
     */
    app.get('/api/projects', function (req, res) {
        console.log('fetch routes');
        Project.find({})
               .sort({websiteProject: 'desc'})
               .select('name repositoryName websiteProjectUrl dateCreated formattedDate websiteProject -_id')
               .exec(function(err, projects) {
                if (err) {
                    console.log(err);
                }
                console.log(projects)
               });
               
        res.status(200).json({
            success: true,
            results: [
                {
                    name: 'All',
                    value: '/projects',
                    text: 'All',
                    disabled: false
                },
                {
                    name: 'Website',
                    value: '/projects/website',
                    text: 'Website',
                    disabled: false
                },
                {
                    name: 'Sale scraper',
                    value: '/projects/website/scraper',
                    text: 'Sale scraper',
                    disabled: false
                }
            ]
        });
    });
    /**
     * 
     */
    app.post('/dashboard/:tab', isLoggedIn, getBreadcrumbs, function (req, res) {
        let tab = req.params.tab;
        let formData = req.body.form;
        let isWebProject = req.body.websiteProject;
        if (tab === 'new') {    // New Project
            
            formData.forEach(function (element, idx) {
                console.log(element.value);
            });
            Project.findOne({})
            let newProject = new Project();
            newProject.author = req.user._id;
            newProject.name = formData[0].value;
            newProject.repositoryName = formData[1].value;
            newProject.shortName = formData[2].value
            newProject.websiteProject = Boolean(isWebProject);
            newProject.websiteProjectUrl = '/projects/website'+formData[2].value;
            let formSize = formData.length;

            for (var i = (3 + parseInt(isWebProject)); i < formSize; i += 2) {
                
                let sectionName = formData[i].value;
                let sectionText = formData[i + 1].value
                if (sectionName === '' || sectionText === '') {
                    return res.status(500).send(['Validation failed.']);
                }
                newProject.sections.push({ title: sectionName, text: sectionText })
            }

            newProject.save(function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).send(['Validation failed.']);
                    //return next(err);
                }
                res.status(200).send({ message: 'Project successfully added to database.' });
            });
        } else if (tab === 'updateScraperData') {
            
        } else if (tab === 'fetchScraperData') {

        } else {
            res.status(500).send(['Vdsasa', 'error tuli taas']);
        }


    })
    /**
     * 
     */
    app.post('/projects/:repo', function (req, res) {
        console.log(req.params.repo);
        /*
        gha.getCommits(req.params.repo)
          .then(function(response) {
            if(response.length === 1 && response[0].isError) {
              return res.status(500).send('Something went wrong.')
            } else {
              return res.status(200).send({
                data: response
                });
            }
          });
          */
        return res.status(200).send({ data: [{ committer: 'Jussi Ristimäki', message: 'Toimiiko tama nyt oleenkaan', days: 5, hours: 4, minutes: 2 }] });
    });

    // ###############################################################################
    // ############################## AUTHENTICATION #################################
    // ###############################################################################
    /**
     * Login page
     */
    app.get('/login', getBreadcrumbs, function (req, res) {
        res.render('login', {
            breadcrumbs: req.breadcrumbs,
            message: req.flash('loginMessage'),
            user: req.user,
        });
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/dashboard', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
    /**
    * Renders 404 page when a page cannot be found.
    */
    app.use(function (req, res, next) {
        res.status(404).render('404', {
            breadcrumbs: [{ breadcrumbName: "404", breadcrumbUrl: "/" }]
        });
    })

}
