'use strict'

require('datejs')
var mh = require('./mischelpers')
var gha = require('./githubapi');
var Project = require('./models/project');
var Product = require('./models/product')
var Store = require('./models/store')
var scraper = require('./projects/scrape.js');

var md = require('markdown-it')();

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
                            console.log("project desc: ", project.desc);
                            res.render('project', {
                                breadcrumbs: req.breadcrumbs,
                                projectName: project.name,
                                repo: project.repositoryName,
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
                gha.getRepository(formData[1].value, gha.gitHubAction.GETDESCRIPTION)
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


        } else {
            res.status(500).send(['Vdsasa', 'error tuli taas']);
        }


    });
    /**
     * Route to fetch data through Github API repository.
     */
    app.get('/api/:action/:repo', function (req, res) {
        let action = req.params.action;
        let repo = req.params.repo;
        if (action === 'commits') {
            gha.getCommits(repo)
                .then(function (response) {
                    if (response.length === 1 && response[0].isError) {
                        return res.status(500).send('Something went wrong.')
                    } else {
                        return res.status(200).send({
                            data: response
                        });
                    }
                });
        } else if (action === 'contributions') {
            gha.getRepository(repo, gha.gitHubAction.GETCONTRIBUTIONS)
                .then(function (data) {
                    let commitCount = data[0].contributions;
                    return res.status(200).send({ commitCount: commitCount });
                });
        } else if (action === 'repository') {
            gha.getRepository(repo, gha.gitHubAction.GETREPOSITORY)
                .then(function (data) {
                    let lang = data.language;
                    let license = "";
                    console.log(data);
                    //console.log(data.hasOwnProperty('license'));
                    if (data.license === null) {
                        license = "Not available";
                    } else {
                        license = data.license.name;
                    }
                    //license = "Not available"
                    let createdAt = new Date(data.created_at).toDateString();
                    return res.status(200).send({ language: lang, license: license, createdAt: createdAt });
                });
        }


        //return res.status(200).send({ data: [{ committer: 'Jussi Ristimäki', message: 'Toimiiko tama nyt oleenkaan', days: 5, hours: 4, minutes: 2 }] });
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
