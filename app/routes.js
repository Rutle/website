'use strict'

require('datejs')
var gha = require('./githubapi');
var Project = require('./models/project');
var Product = require('./models/product')
var Store = require('./models/store')
var scraper = require('./projects/scrape.js');


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


function isAdmin(req, res, next) {
    if (req.user.rights === 'admin') {
        return next();
    }
    res.redirect('/')
}
/**
 * Middleware function to fetch Projects made for the website from the database and pass them into the response.
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 */
function getProjects(req, res, next) {
    Project.find({ websiteProject: true })
        .sort({ name: 'desc' })
        .select('name websiteProjectURL -_id')
        .exec(function (err, projects) {
            if (err) {
                console.log(err);
            }
            res.locals.siteProjects = projects;
            return next();
        })
}
/**
 * Function to retrieve product counts per store.
 * @param {Function} callback 
 */
function getProductCounts(callback) {
    Product.aggregate([
        { $group: { _id: '$store', count: { "$sum": 1 } } },
        { $lookup: { from: "stores", localField: "_id", foreignField: "_id", as: "store" } },
        { $unwind: '$store' }
    ]).exec(function (err, productCounts) {
        if (err) {
            console.log(err);
            callback(err, null);
        }
        //console.log(productCounts);
        let proCounts = productCounts.map(elem => ({ storeName: elem.store.name, count: elem.count }));
        callback(null, proCounts);
    })
}

function getMatchingStores(obj, callback) {
    let productIds = Object.values(obj);
    Product.aggregate([
        { $match: { "_id": { $in: productIds } } },
        { $group: { "_id": "$store", count: { "$sum": 1 } } },
        { $lookup: { from: "stores", localField: "_id", foreignField: "_id", as: "store" } },
        { $unwind: '$store' }
    ]).exec(function (err, storeCounts) {
        if (err) {
            console.log(err);
            callback(err, null);
        }
        callback(null, storeCounts);
    })
}

const arrayToObject = (array) => array.reduce((obj, item) => {
    obj[item.url] = item._id;
    return obj;
}, {});

module.exports = function (app, passport) {

	/**
	 * Main page.
	 */
    app.get('/', getBreadcrumbs, getProjects, function (req, res) {
        console.log(res.locals.projects);
        res.render('home', {
            breadcrumbs: req.breadcrumbs,
            user: req.user,
        });

    });

	/**
	 * Projects page.
	 */
    app.get('/projects', getBreadcrumbs, getProjects, function (req, res) {
        res.render('projects', {
            breadcrumbs: req.breadcrumbs,
            user: req.user,
        });
    });


	/**
	 * Website project route.
	 */
    app.get('/projects/website', getBreadcrumbs, getProjects, function (req, res) {
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
    app.get('/projects/website/scraper', getBreadcrumbs, getProjects, function (req, res) {
        let saleLimit = (5).days().ago();
        Product.find({ latestSaleDate: { $gte: saleLimit } })
            .sort({ name: 'desc' })
            .select('name category productUrl salesDates -_id')
            .exec(function (err, products) {
                let success = false;
                let data = [];
                let message = "";
                if (err) {
                    success = false;
                    data = null;
                    message = 'There was a problem with searching products from database.';
                } else if (products && products.length === 0) {
                    success = true;
                    data = null;
                    message = 'No products found on sale.';
                } else {
                    success = true;
                    data = products;
                    message = 'Products found.';
                }
                console.log(products[0]);
                return res.render('scraper', {
                    breadcrumbs: req.breadcrumbs,
                    projectName: 'Sale price scraper',
                    repo: 'scraper',
                    user: req.user,
                    success: success,
                    data: data,
                    message: message 
                });
            });
    });

	/**
	 * Price scraper project route.
	 */
    app.get('/projects/scraper', getBreadcrumbs, getProjects, function (req, res) {
        res.render('scraper', {
            breadcrumbs: req.breadcrumbs,
            projectName: 'Sale price scraper',
            repo: 'Testi',
            user: req.user,
        });
    });

    /**
     * Dashboard route.
     */
    app.get('/dashboard', isLoggedIn, getBreadcrumbs, getProjects, function (req, res) {
        getProductCounts(function (err, data) {
            if (err) {
                return res.render('dashboard', {
                    breadcrumbs: req.breadcrumbs,
                    user: req.user,
                    productCounts: null,
                    productErrMessage: 'There was a problem with database.'
                })
            }
            return res.render('dashboard', {
                breadcrumbs: req.breadcrumbs,
                user: req.user,
                productCounts: data,
            })
        })

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
                result.push({ name: 'Stores', value: 'Stores', text: 'Stores', disabled: true })
                result.push({ name: 'All', value: 'All', text: 'All stores', disabled: false })
                projects.forEach(function (elem, idx) {
                    result.push({ name: elem.name, value: elem._id, text: elem.name, disabled: false })
                })
                return res.status(200).json({ success: true, results: result })
            });


    });

    /**
     * API endpoint for fetching sales from database.
     */
    app.post('/api/stores/:store', function (req, res) {
        let storeId = req.params.store.trim();
        let saleLimit = (5).days().ago();
        if (storeId) {
            Product.find({ $and: [{ store: storeId }, { latestSaleDate: { $gte: saleLimit } }] })
                .sort({ name: 'desc' })
                .select('name category productUrl salesDates -_id')
                .exec(function (err, products) {
                    if (err) {
                        console.log("Find products by store id for sale list: ", err);
                        return res.status(500).json({ success: false, message: 'There was a problem with searching products from database.' })
                    }
                    if (products && products.length === 0) {
                        return res.status(200).json({ success: true, data: null, message: 'No products found on sale.' })
                    }
                    console.log(products.length);
                    return res.status(200).json({ success: true, data: products, message: 'Products found.' })
                });

        }

    })

    /**
     * Getting keywords for stores.
     */
    app.get(['/api/storekeywords', '/api/storekeywords/:id'], isLoggedIn, function (req, res) {
        console.log('param: ', req.params.id);
        if (!req.params.id) {
            Store.find({})
                .sort({ name: 'desc' })
                .select('name url')
                .exec(function (err, projects) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ success: false })
                    }
                    let result = [];
                    projects.forEach(function (elem, idx) {
                        result.push({ name: elem.name, value: elem._id, text: elem.name, disabled: false })
                    })
                    return res.status(200).json({ success: true, results: result })
                });
        } else {
            Store.findById(req.params.id)
                .select('keywords')
                .exec(function (err, store) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ success: false });
                    }
                    let result = [];
                    store.keywords.forEach(function (elem, idx) {
                        console.log(elem);
                        result.push({ name: elem, value: elem, text: elem, disabled: false })
                    });
                    return res.status(200).json({ success: true, results: result })
                });

        }

    });
    /**
     * Scraper tab on dashboard.
     */
    app.post('/dashboard/scraper/:action', isLoggedIn, function (req, res) {
        let keyword = req.body.keyword;
        let storeId = req.body.storeId;
        let action = req.params.action;
        if (action === 'removekeyword') {
            Store.findById(storeId, 'keywords', function (err, store) {
                if (err) {
                    return res.status(500).json({ message: 'Error in finding store.' });
                }
                if (!store.keywords.includes(keyword)) {
                    return res.status(500).json({ message: 'Keyword was not found.' });
                }
                store.keywords = store.keywords.filter(e => e !== keyword);
                store.save(function (err) {
                    if (err) {
                        console.log("keyword removal save error: ", err);
                    }
                    return res.status(200).json({ message: 'Selected keyword removed.' })
                })

            })
        } else if (action === 'addkeyword') {
            console.log('Add new keyword');
            if (keyword === '') return res.status(500).json({ message: 'Please type non-empty keyword.' })
            Store.findById(store, 'keywords', function (err, store) {
                if (err) {
                    return res.status(500).json({ message: 'Error in finding store from database.' });
                }
                if (store.keywords.includes(keyword)) {
                    return res.status(500).json({ message: 'Keyword is already exists.' });
                }
                store.keywords.push(keyword);
                store.save(function (err) {
                    if (err) {
                        console.log("keyword adding save error: ", err);
                    }
                })
                return res.status(200).json({ message: 'Keyword ' + keyword + ' added to the list.' })
            })
        } else if (action === 'update') {
            Store.find({})
                .sort({ name: 'desc' })
                .select('name url keywords _id')
                .exec(function (err, stores) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ success: false, message: 'Error.' })
                    }
                    if (!stores) {
                        return res.status(500).json({ success: false, message: 'None found.' })
                    }
                    scraper.getData(stores)
                        .then(function (data) {
                            //console.log("haettu data: \n", data);
                            let result = [];
                            const storeIds = arrayToObject(stores);
                            console.log(storeIds)
                            data.forEach(function (elem, idx) {

                                let documentObj = {
                                    'updateOne': {
                                        'filter': { productId: elem.productId },
                                        'update': {
                                            '$set': {
                                                latestSaleDate: new Date()
                                            },
                                            '$push': {
                                                salesDates: {
                                                    salePrice: elem.currentPrice,
                                                    normalPrice: elem.regularPrice,
                                                    dateOfSale: new Date(),
                                                    storeId: elem.storeProductId
                                                }
                                            },
                                            '$setOnInsert': {
                                                name: elem.pname,
                                                category: elem.category,
                                                productId: elem.productId,
                                                productUrl: elem.url,
                                                store: storeIds[elem.storeUrl]
                                            }
                                        },
                                        'upsert': true,
                                    }

                                }
                                result.push(documentObj);
                            });
                            return result;
                        }, function (err) {
                            console.log(err);
                        })
                        .then(function (data) {
                            Product.collection.bulkWrite(data)
                                .then(bulkWriteOpResult => {
                                    console.log('BULK update OK');
                                    console.log(JSON.stringify(bulkWriteOpResult, null, 2));
                                    let resultObj = {
                                        upserted: bulkWriteOpResult.upsertedCount,
                                        modified: bulkWriteOpResult.modifiedCount
                                    }
                                    if (bulkWriteOpResult.upsertedCount > 0) {
                                        getMatchingStores(bulkWriteOpResult.upsertedIds, function (err, data) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            console.log(data);
                                            let newByStore = data.map(elem => ({ storeName: elem.store.name, count: elem.count }));
                                            return res.status(200).json({ success: true, data: resultObj, newInsertByStore: newByStore })
                                        });
                                    }

                                })
                                .catch(err => {
                                    console.log('BULK update error');
                                    console.log(JSON.stringify(err, null, 2));
                                });
                        }, function (err) {
                            console.log(err);
                        });


                });
        } else if (action === 'refresh') {
            getProductCounts(function (err, data) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'There was a problem with database.' })
                }
                return res.status(200).json({ success: true, data: data })
            })

        } else {

        }

    });
    /**
     * Dropdown API for main menu projects dropdown
     */
    app.get('/api/projects', function (req, res) {
        Project.find({ websiteProject: false })
            .sort({ websiteProject: 'desc' })
            .select('name repositoryName websiteProjectUrl dateCreated formattedDate websiteProject -_id')
            .exec(function (err, projects) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({ success: false })
                }

                let result = [];
                projects.forEach(function (elem, idx) {
                    result.push({
                        name: elem.name, value: elem.websiteProjectUrl,
                        text: elem.title, disabled: false
                    })
                })
                return res.status(200).json({ success: true, results: result })

            });
    });

    /**
     * Dashboard route
     */
    app.post('/dashboard/:tab', isLoggedIn, getBreadcrumbs, function (req, res) {
        let tab = req.params.tab;
        let formData = req.body.form;
        let isWebProject = (req.body.websiteProject === '1');
        console.log(isWebProject);

        if (tab === 'new') {    // New Project

            formData.forEach(function (element, idx) {
                console.log(element.value);
            });
            //Project.findOne({})
            let newProject = new Project();
            newProject.author = req.user._id;
            newProject.name = formData[0].value;
            newProject.repositoryName = formData[1].value;
            newProject.shortName = formData[2].value
            newProject.websiteProject = isWebProject;

            if (isWebProject) {
                newProject.websiteProjectURL = '/projects/website/' + formData[2].value;
            } else {
                newProject.websiteProjectURL = '/projects/' + formData[1].value;
            }
            console.log(newProject.websiteProjectURL)
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
        } else if (tab === 'scraper') {
            if (req.body.action === 'update') {

            }

        } else if (tab === 'fetchScraperData') {

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
    app.get('/login', getBreadcrumbs, getProjects, function (req, res) {
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
