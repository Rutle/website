'use strict'

require('datejs')
var mh = require('./mischelpers')
var gha = require('./githubapi');
var Project = require('./models/project');
var Product = require('./models/product')
var Store = require('./models/store')
var scraper = require('./projects/scrape.js');

var md = require('markdown-it')();

const arrayToObject = (array) => array.reduce((obj, item) => {
    obj[item.url] = { id: item._id, name: item.name };
    return obj;
}, {});

module.exports = function (app, passport) {

	/**
	 * Main page.
	 */
    app.get('/', mh.getBreadcrumbs, mh.getProjects, function (req, res) {
        //console.log(res.locals.projects);
        res.render('home', {
            breadcrumbs: req.breadcrumbs,
            user: req.user,
        });

    });

	/**
	 * Projects page.
	 */
    app.get('/projects', mh.getBreadcrumbs, mh.getProjects, function (req, res) {
        res.render('projects', {
            breadcrumbs: req.breadcrumbs,
            user: req.user,
        });
    });


	/**
	 * Website project route.
	 */
    app.get('/projects/:repo', mh.getBreadcrumbs, mh.getProjects, function (req, res) {
        if (req.params.repo) {
            gha.getRepository(req.params.repo, gha.gitHubAction.GETDESCRIPTION)
                .then(function (data) {
                    //console.log("readme raw: ", data);
                    Project.findOne({ repositoryName: req.params.repo })
                        .exec(function (err, project) {
                            //console.log("project desc: ", project.desc);
                            res.render('project', {
                                breadcrumbs: req.breadcrumbs,
                                projectName: 'Personal website',
                                repo: 'website',
                                user: req.user,
                                htmldesc: project.desc
                            });
                        })

                })
        }


    });
    /**
     * Dashboard route.
     */
    app.get('/dashboard', mh.isLoggedIn, mh.getBreadcrumbs, mh.getProjects, function (req, res) {
        mh.getProductCounts(function (err, data) {
            if (err) {
                return res.render('dashboard', {
                    breadcrumbs: req.breadcrumbs,
                    user: req.user,
                    productCounts: null,
                    productErrMessage: 'There was a problem with database.'
                });
            }
            return res.render('dashboard', {
                breadcrumbs: req.breadcrumbs,
                user: req.user,
                productCounts: data,
            });
        });

    });

    
    /**
     * Dropdown API for scraper project.
     */
    app.get('/api/stores', function (req, res) {
        Store.find({})
            .sort({ name: 'desc' })
            .select('name url')
            .exec(function (err, projects) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ success: false })
                }
                let result = [];
                //result.push({ name: 'Stores', value: 'Stores', text: 'Stores', disabled: false })
                result.push({ name: 'All', value: 'All', text: 'All stores', disabled: false })
                projects.forEach(function (elem, idx) {
                    result.push({ name: elem.name, value: elem._id, text: elem.name, disabled: false })
                })
                return res.status(200).json({ success: true, results: result })
            });


    });

    
    /**
     * Dropdown API for main menu projects dropdown
     */
    app.get('/api/projects', function (req, res) {
        //console.log("api projects kutsuttu");
        Project.find({ websiteProject: false })
            .sort({ websiteProject: 'desc' })
            .select('name repositoryName websiteProjectURL dateCreated formattedDate websiteProject -_id')
            .exec(function (err, projects) {
                //console.log(projects);
                if (err) {
                    console.log(err);
                    return res.status(500).json({ success: false })
                }
                console.log("api: ", projects)
                let result = [];
                projects.forEach(function (elem, idx) {
                    result.push({
                        name: elem.name, value: elem.websiteProjectURL,
                        text: elem.title, disabled: false
                    })
                })
                return res.status(200).json({ success: true, results: result })

            });
    });

    /**
     * Dashboard route
     */
    app.post('/dashboard/:tab', mh.isLoggedIn, mh.getBreadcrumbs, function (req, res) {
        let tab = req.params.tab;
        let formData = req.body.form;
        let isWebProject = (req.body.websiteProject === '1');

        if (tab === 'new') {    // New Project
            let newProject = new Project();
            newProject.author = req.user._id;
            newProject.name = formData[0].value;
            newProject.repositoryName = formData[1].value;
            newProject.shortName = formData[2].value
            newProject.websiteProject = isWebProject;
            newProject.shortDesc = isWebProject ? formData[4].value : formData[3].value;

            if (isWebProject) {
                newProject.websiteProjectURL = '/' + formData[2].value;
                newProject.save(function (err) {
                    if (err) {
                        console.error(err);
                        return res.status(500).send(['Validation failed.']);
                    }
                    res.status(200).send({ message: 'Project successfully added to database.' });
                });
            } else {
                newProject.websiteProjectURL = '/projects/' + formData[1].value;
                gha.getRepository('website', gha.gitHubAction.GETDESCRIPTION)
                    .then(function (data) {
                        //console.log("readme raw: ", data);
                        newProject.desc = md.render(data);
                        //console.log(newProject.desc);
                        newProject.save(function (err) {
                            if (err) {
                                console.error(err);
                                return res.status(500).send(['Validation failed.']);
                                //return next(err);
                            }
                            res.status(200).send({ message: 'Project successfully added to database.' });
                        });
                    });

            }

        } else if (tab === 'projects' && req.body.shortName) {
            console.log(req.body.shortName)
            Project.findOneAndRemove({ shortName: req.body.shortName }, function (err, project) {
                res.status(200).json({ success: true, result: project, message: project.name + 'has been removed' })
            });


        } else if (tab === 'newstore') {
            let newStore = new Store();
            newStore.name = formData[0].value.trim();
            newStore.url = formData[1].value.trim();
            newStore.keywords = formData[2].value.trim().split(';');
            newStore.save(function (err) {
                if (err) {
                    console.log(err);
                    let errMessage = "";
                    // Duplicate error.
                    if (err.code === 11000 || err.name === 'MongoError') {
                        console.log(err.message);
                        if (err.message.includes(formData[0].value.trim())) {
                            errMessage = 'That name already exists.';
                        } else {
                            errMessage = 'That URL already exists.';
                        }
                    }
                    return res.status(500).send([errMessage])
                }
                res.status(200).send({ message: 'Store successfully added to database.' })
            })
        } else {
            res.status(500).send(['Vdsasa', 'error tuli taas']);
        }


    })
    /**
     * Route to fetch commits for a repository.
     */
    app.get('/projects/:repo', function (req, res) {
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
    app.get('/login', mh.getBreadcrumbs, mh.getProjects, function (req, res) {
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
        Project.find({ websiteProject: true })
            .sort({ name: 'desc' })
            .select('name websiteProjectURL -_id')
            .exec(function (err, projects) {
                if (err) {
                    console.log(err);
                }
                return res.status(404).render('404', {
                    breadcrumbs: [{ breadcrumbName: "404", breadcrumbUrl: "/" }],
                    siteProjects: projects
                });
            })

    })

}
