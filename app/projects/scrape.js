'use strict'
var axios = require('axios');
var cheerio = require('cheerio');
//var fs = require('fs');
var parseData = require('./parser.js')

/**
 * Enum for actions.
 * @readonly
 * @enum {String}
 */
const gitHubAction = {
    GETDESCRIPTIONS: 'getDescriptions',
    GETREPOSITORY: 'getRepository',
    INVALIDACTION: 'Invalid action'
};


/**
 * Fetches data from a website defined by url.
 * @param {Array} stores List of stores to fetch data from.
 */
function getData(stores) {
    return axios.all(stores.map(l => axios.get(l.url)))
        .then(axios.spread((...args) => {
            var siteData = []
            for (let i = 0; i < args.length; i++) {
                if (args[i].status === 200 && args[i].config.url === 'https://www.jimms.fi/') {
                    const html = args[i].data;
                    const $ = cheerio.load(html);
                    let productList = []
                    let storeUrl = args[i].config.url;
                    let status = args[i].status;
                    $('div.pcol > div.productitem').each(function (i, elem) {
                        productList[i] = {
                            storeUrl: storeUrl,
                            status: status,
                            pname: $(this).children('.p_name').children().first().text().trim(),
                            currentPrice: $(this).children('.p_bottom').children('.p_price').first().text().trim(),
                            url: $(this).children('.p_name').children().first().attr('href'),
                        }
                    });
                    // Remove first element from array.
                    productList.shift();

                    // Clean up undefined elements.
                    productList = productList.filter(n => n != undefined);

                    let store = stores.find(function(store) {
                        return store.url === args[i].config.url;
                    });

                    // Parse relevant data and modify it to desired format.
                    productList = parseData.parseArr(productList, args[i].config.url, store.keywords);

                    // Add elements from productList to siteData.
                    siteData.push(...productList);

                } else if (args[i].config.url === 'https://www.verkkokauppa.com/' && args[i].status === 200) {

                    let obj = {
                        url: args[i].config.url,
                        status: args[i].status
                    }
                    siteData.push(obj);
                } else {
                    let obj = {
                        url: args[i].config.url,
                        status: args[i].status
                    }
                    siteData.push(obj);
                }
            }
            /*
            console.log("Eka site data: ", siteData.filter(function (l) {
                return l.status === 200;
            }).map((li) => li.url));
            */
            return siteData;
            /*
            fs.writeFile('productList.json',
                JSON.stringify(pListTrimmed, null, 4),
                (err) => console.log('File successfully written!'));
            */

        }, function (err) {
            console.log("First error ", err);
        }))
        .then(function (data) {
            // Fetch each product's category and productId information, that are on sale.
            return getProductPages(data).then(function (refinedData) {
                console.log("refined Data: ", refinedData);
                return refinedData;
            }, function (error) {
                console.log("Error in calling [getProductPages]: ", error);
            })

        }, function (error) {
            console.log("Second error ", error)
        });
}
/**
 * Function to fetch repository data.
 * @param {String} repo Name of the Github repository.
 * @param {Enum} action What is fetched.
 */
function getRepository(repo, action) {
    switch (action) {
        case gitHubAction.GETREPOSITORY:
            return axios.get('https://api.github.com/repos/rutle/' + repo + '/commits?per_page=3&sha=master')
                .then(function (response) {
                    if (response.status === 200) {
                        const json = response.data;
                        const headers = response.headers;
                        console.log("eka: ", json);
                        /*
                        fs.writeFile('apitest.json',
                            JSON.stringify(json, null, 4),
                            (err) => console.log('File successfully written!'));
                        */
                        return json;
                    }

                }, function (err) {
                    console.log("Repository fetching error [GETREPOSITORY]: ", err);
                });
            break;
        case gitHubAction.GETDESCRIPTIONS:
            return axios.get('https://api.github.com/users/rutle/repos')
                .then(function (response) {
                    if (response.status === 200) {
                        const json = response.data;
                        const headers = reponse.headers;
                        let descData = [];
                        json.forEach((elem, idx) => {
                            descData.push({ repo: elem.name, description: elem.desciption })
                        })

                        //console.log("repos data: ", json);
                        return descData;
                    }
                }, function (err) {
                    console.log("Description fetching error [GETDESCRIPTIONS]: ", err);
                })
            break;
        default:
            return gitHubAction.INVALIDACTION;
            break;
    }

}

/**
 * Function to fetch the page of each given link in links-array and add information back to the array.
 * @param {Array} links 
 */
function getProductPages(links) {
    return axios.all(links.filter(function (l) {
        return l.status === 200
    }).map((li) => axios.get(li.url)))
        .then(function (results) {
            results.forEach(element => {
                console.log("status: ", element.status)
                if (element.status === 200 && element.config.url.includes('https://www.jimms.fi/')) {
                    let $ = cheerio.load(element.data);
                    //console.log("config: ", element.config.url);
                    const regex = /https:\/\/www.jimms.fi\/fi\/Product\/Show\/(.*?)(\/)/gm;
                    let storeProductId = element.config.url.match(regex)[0];

                    let idx = links.findIndex(item => item.url === element.config.url);
                    //links[idx].category = $('.breadcrumb').children().last().prev().children('a').first().children('span').first().text();
                    links[idx].category = $('#productgroupmenu > div.list-group-item.menu > ul > li.open > a').text().trim();
                    links[idx].productId = $('#pinfo_propinfo > div:nth-child(1) > div:nth-child(2)').text().trim();
                    links[idx].storeProductId = storeProductId;
                    //let category = $('.breadcrumb').children().last().prev().children('a').first().children('span').first().text();
                    //let categoryUrl = $('.breadcrumb').children().last().prev().children('a').first().attr('href');
                    //let productId = $('#pinfo_propinfo > div:nth-child(1) > div:nth-child(2)').text();
                    //console.log('cat: ', links[idx].category);
                    //console.log('url: ', links[idx].categoryUrl);
                    //console.log('id: ', links[idx].productId, '\n');
                } else if (element.status === 200 && element.config.url.includes('https://www.verkkokauppa.com/')) {
                    let idx = links.findIndex(item => item.url === element.config.url);
                    links[idx].category = 'Testi'
                    links[idx].categoryUrl = 'Testi'
                    links[idx].productId = 'Testi'

                } else if(element.status === 200 && element.config.url.includes('https://www.power.fi/')) {
                    let $ = cheerio.load(element.data);
                }
            });
            return links;

        }, function (err) {
            console.log("Error inside getProductPages: ", err);
        });
}

module.exports = {
    gitHubAction: gitHubAction,
    getData: getData,
    getRepository: getRepository
};