'use strict'

require('datejs')
var mh = require('./mischelpers');
var Product = require('./models/product')
var Store = require('./models/store')
var scraper = require('./projects/scrape.js');

const arrayToObject = (array) => array.reduce((obj, item) => {
    obj[item.url] = { id: item._id, name: item.name };
    return obj;
}, {});

/**
 * Module containing routes for scraper related actions.
 * @module app/scraperroutes
 * @param {Object} app
 * @param {Object} passport
 */
module.exports = function (app, passport) {
    /**
     * Route for the sales scraper data on the website.
     */
    app.get('/scraper', mh.getBreadcrumbs, mh.getProjects, function (req, res) {
        let saleLimit = (5).days().ago();
        Product.find({ latestSaleDate: { $gte: saleLimit } })
            .sort({ name: 'desc' })
            .select('name category productUrl salesDates store -_id')
            .populate('store', 'name -_id')
            .exec(function (err, products) {
                let success = false;
                let data = [];
                let message = "";
                let categories = {};
                if (err) {
                    success = false;
                    message = 'There was a problem with searching products from database.';
                } else if (products && products.length === 0) {
                    success = true;
                    message = 'No products found on sale.';
                } else {
                    success = true;
                    let unique_cats = [];
                    products.forEach(function (elem, idx, array) {
                        data.push({
                            category: elem.category,
                            name: elem.name,
                            productUrl: elem.productUrl,
                            storeName: elem.store.name,
                            latestSalePrice: elem.latestSalePrice,
                            latestNormalPrice: elem.latestNormalPrice,
                        });
                        if (unique_cats.indexOf(elem.category) === -1 && elem.category !== '') {
                            unique_cats.push(elem.category);
                            if (categories[elem.store.name] === undefined) {
                                categories[elem.store.name] = [];
                                categories[elem.store.name].push({
                                    name: elem.category, value: elem.category,
                                    text: elem.category, disabled: false
                                });
                            } else {
                                categories[elem.store.name].push({
                                    name: elem.category, value: elem.category,
                                    text: elem.category, disabled: false
                                });
                            }
                        }
                    })
                    message = 'Products found.';
                }
                return res.render('scraper', {
                    breadcrumbs: req.breadcrumbs,
                    projectName: 'Sale price scraper',
                    repo: 'scraper',
                    user: req.user,
                    success: success,
                    data: data,
                    sessionData: JSON.stringify(data),
                    message: message,
                    storeCategories: JSON.stringify(categories)
                });
            });
    });

    app.get('/api/storecampaigns/:storeId', mh.isLoggedIn, function (req, res) {
        let id = req.params.storeId;
        console.log(id);
        Store.findById(id, function (err, store) {
            if (err) {
                return res.status(500).json({ success: false, results: null, message: ['There was a problem with database.'] });
            }

            return res.status(200).json({ success: true, results: store.campaignUrls });

        });

    });

    /**
     * API endpoint for fetching sales from database.
     */
    app.get('/api/stores/:store', function (req, res) {
        let storeId = req.params.store.trim();
        let saleLimit = (5).days().ago();
        if (storeId) {
            Product.find({ $and: [{ store: storeId }, { latestSaleDate: { $gte: saleLimit } }] })
                .sort({ name: 'desc' })
                .select('name category productUrl salesDates -_id')
                .exec(function (err, products) {
                    if (err) {
                        console.log("Find products by store id for sale list: ", err);
                        return res.status(500).json({ success: false, message: 'There was a problem with searching products from database.' });
                    }
                    if (products && products.length === 0) {
                        return res.status(200).json({ success: true, data: null, message: 'No products found on sale.' });
                    }
                    console.log(products);

                    return res.status(200).json({ success: true, data: products, message: 'Products found.' });
                });

        }

    });

    /**
     * Getting keywords for stores.
     */
    app.get(['/api/storekeywords', '/api/storekeywords/:id'], mh.isLoggedIn, function (req, res) {
        //console.log('param: ', req.params.id);
        if (!req.params.id) {
            Store.find({})
                .sort({ name: 'desc' })
                .select('name url')
                .exec(function (err, projects) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ success: false });
                    }
                    let result = [];
                    projects.forEach(function (elem, idx) {
                        result.push({ name: elem.name, value: elem._id, text: elem.name, disabled: false });
                    })
                    return res.status(200).json({ success: true, results: result });
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
                        result.push({ name: elem, value: elem, text: elem, disabled: false })
                    });
                    return res.status(200).json({ success: true, results: result });
                });

        }

    });

    /**
     * API route to fetch product counts.
     */
    app.get('/api/scraper/salesdata', mh.isLoggedIn, function (req, res) {
        mh.getProductCounts(function (err, data) {
            if (err) {
                return res.status(500).json({ success: false, message: 'There was a problem with database.' });
            }
            return res.status(200).json({ success: true, data: data });
        })
    })

    /**
     * Scraper tab on dashboard.
     */
    app.post('/dashboard/scraper/:action', mh.isLoggedIn, function (req, res) {
        let keyword = req.body.keyword;
        let storeId = req.body.storeId;
        let action = req.params.action;
        console.log(action);
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

            });
        } else if (action === 'newstore') {            
            let formData = req.body.form;
            let newStore = new Store();
            newStore.name = formData[0].value.trim();
            newStore.url = formData[1].value.trim();
            newStore.keywords = formData[2].value.trim().split(';');
            newStore.save(function (err) {
                if (err) {
                    //console.log(err);
                    let errMessage = "";
                    // Duplicate error.
                    if (err.code === 11000 || err.name === 'MongoError') {
                        //console.log(err.message);
                        if (err.message.includes(formData[0].value.trim())) {
                            errMessage = 'That name already exists.';
                        } else {
                            errMessage = 'That URL already exists.';
                        }
                    }
                    return res.status(500).send({ messages: [{ value: errMessage }] })
                }
                res.status(200).send({ message: 'Store successfully added to database.' })
            });
            
        } else if (action === 'addkeyword') {
            if (keyword === '') return res.status(500).json({ message: 'Please type non-empty keyword.' });
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
                return res.status(200).json({ message: 'Keyword ' + keyword + ' added to the list.' });
            });
        } else if (action === 'update') {
            Store.find({})
                .sort({ name: 'desc' })
                .select('name url campaignUrls keywords _id')
                .exec(function (err, stores) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ success: false, message: 'Error.' });
                    }
                    if (!stores) {
                        return res.status(500).json({ success: false, message: 'None found.' });
                    }
                    console.log(stores);

                    scraper.getData(stores)
                        .then(function (data) {
                            let result = [];
                            const storeIds = arrayToObject(stores);
                            console.log(data);

                            data.forEach(function (elem, idx) {
                                let pId = "";
                                if (elem.productId === '' || elem.productId === undefined) {
                                    pId = storeIds[elem.storeUrl].name + elem.storeProductId;
                                } else { pId = elem.productId }

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
                                                }
                                            },
                                            '$setOnInsert': {
                                                name: elem.pname,
                                                category: elem.category,
                                                productId: pId,
                                                productUrl: elem.url,
                                                store: storeIds[elem.storeUrl].id
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
                                        mh.getMatchingStores(bulkWriteOpResult.upsertedIds, function (err, data) {
                                            if (err) {
                                                console.log(err);
                                            }
                                            console.log(data);
                                            let newByStore = data.map(elem => ({ storeName: elem.store.name, count: elem.count }));
                                            return res.status(200).json({ success: true, results: resultObj, newInsertByStore: newByStore })
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
                    return res.status(500).json({ success: false, message: 'There was a problem with database.' });
                }
                return res.status(200).json({ success: true, data: data });
            })

        } else if (action === 'addcampaign') {
            let name = req.body.name;
            let url = req.body.url;

            Store.findByIdAndUpdate(storeId,
                { $push: { campaignUrls: { name: name, url: url, isActive: true } } },
                { new: true },
                function (err, store) {
                    if (err) {
                        console.log(err)
                        return res.status(500).json({ success: false, data: null, message: ['There was a problem with database.'] });
                    }
                    return res.status(200).json({ success: true, results: store.campaignUrls });
                });
        } else if (action === 'removecampaign') {
            let name = req.body.name;
            let url = req.body.url;

            Store.findByIdAndUpdate(storeId,
                { $pull: { campaignUrls: { name: name, url: url } } },
                function (err, store) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ success: false, message: ['There was a problem with database.'] });
                    }
                    return res.status(200).json({ success: true, message: ['There was a problem with database.'] });
                }
            );

        } else if (action === 'toggleactivity') {

            let name = req.body.name;
            let url = req.body.url;
            let isActive = (req.body.isActive == 'true');

            Store.updateOne({ _id: storeId, campaignUrls: { $elemMatch: { name: name, url: url } } },
                { $set: { "campaignUrls.$.isActive": isActive } }, { new: true },
                function (err, store) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json({ success: false });
                    }
                    return res.status(200).json({ success: true });
                })
        }

    });
}