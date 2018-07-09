var Project = require('./models/project');
var Product = require('./models/product');

module.exports = {

    // Function for getting breadcrumbs of the page
    getBreadcrumbs: function (req, res, next) {
        const urls = req.originalUrl.split('/');
        urls.shift();
        req.breadcrumbs = urls.map((url, i) => {
            return {
                breadcrumbName: (url === '' ? 'Home' : url.charAt(0).toUpperCase() + url.slice(1)),
                breadcrumbUrl: `/${urls.slice(0, i + 1).join('/')}`,
            };
        });
        next();
    },

    // Check if user is logged in with a middleware
    isLoggedIn: function (req, res, next) {
        if (req.isAuthenticated())
            return next();
        res.redirect('/');
    },

    /**
     * Middleware function to fetch Projects made for the website from the database and pass them into the response.
     * @param {Object} req 
     * @param {Object} res 
     * @param {Function} next 
     */
    getProjects: function (req, res, next) {
        Project.find()
            .sort({ name: 'desc' })
            .select('name websiteProject websiteProjectURL shortName shortDesc repositoryName -_id')
            .exec(function (err, projects) {
                if (err) {
                    console.log(err);
                }
                //console.log(projects)
                res.locals.siteProjects = projects;
                return next();
            });
    },

    /**
     * Function to retrieve product counts per store.
     * @param {Function} callback Callback function.
     */
    getProductCounts: function (callback) {
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
    },
    /**
     * 
     * @param {Object} obj
     * @param {Function} callback
     */
    getMatchingStores: function(obj, callback) {
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

}


