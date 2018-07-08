'use strict'
var axios = require('axios');
var cheerio = require('cheerio');
var fs = require('fs');
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
                if (args[i].status === 200) {
                    const html = args[i].data;
                    const $ = cheerio.load(html);
                    let storeUrl = args[i].config.url;
                    let status = args[i].status;

                    if (storeUrl === 'https://www.jimms.fi/') {
                        let productList = []
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

                        let store = stores.find(function (store) {
                            return store.url === args[i].config.url;
                        });

                        // Parse relevant data and modify it to desired format.
                        productList = parseData.parseArr(productList, args[i].config.url, store.keywords);

                        // Add elements from productList to siteData.
                        siteData.push(...productList);
                    } else if (storeUrl === 'https://cdon.fi/kesaale/tietokoneet/naytot/') {
                        let productList = [];
                        /*
                                  newObjectList[newCounter] = {
            storeUrl: objectList[i].storeUrl,
            status: objectList[i].status,
            pname: productItem,
            currentPrice: parseFloat(objectList[i].currentPrice.match(/\d+(?:\,\d+)?/g)),
            url: jimmsUrl.slice(0, -1)+objectList[i].url,
            regularPrice: parseFloat(price),
            productId: "",
            category: "",
            storeProductId: ""
                        */
                        let $ = cheerio.load(response.data);
                        $('main > section > ul > li').each(function (i, elem) {
                            let art = $(this).children('article');
                            if (art.children('div.product-image-wrapper').children('a').first().children('div.price-splash').length === 1) {
                                productList.push({
                                    storeUrl: storeUrl,
                                    status: status,
                                    pname: art.children('.full-title').attr('value'),
                                    currentPrice: art.children('div.product-price-wrapper').children().first().text().trim(),
                                    regularPrice: art.children('div.product-price-wrapper').children().eq(1).text().trim(),
                                    url: 'https://cdon.fi'+art.children('div.product-title-wrapper').children('a').first().attr('href'),
                                    productId: '',
                                    category: art.children('.category-title').attr('value').split('/').splice(-1, 1)[0],
                                    storeProductId: art.children('.product-id').attr('value'),
                                });
                            }
                        })

                        //let name = article.children().first().attr('value');
                        //let storeProductId = article.children().eq(1).attr('value');
                        //let categoryString = article.children().eq(2).attr('value').split('/').splice(-1, 1)[0];
                        //let salePrice = article.children('div.product-price-wrapper').children().first().text().trim();
                        //let normalPrice = article.children('div.product-price-wrapper').children().eq(1).text().trim();
                        //console.log(name, storeProductId, categoryString, salePrice, normalPrice);

                        siteData.push(obj);
                    } else {
                        let obj = {
                            url: args[i].config.url,
                            status: args[i].status
                        }
                        siteData.push(obj);
                    }

                }

            }

            /*
            console.log("Eka site data: ", siteData.filter(function (l) {
                return l.status === 200;
            }).map((li) => li.url));
            */

            /*
            fs.writeFile('productList.json',
                JSON.stringify(pListTrimmed, null, 4),
                (err) => console.log('File successfully written!'));
            */
            return siteData;

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
                        //const headers = response.headers;
                        //console.log("eka: ", json);
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
                        //const headers = reponse.headers;
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
                    links[idx].category = $('#productgroupmenu > div.list-group-item.menu > ul > li.open > a').text().trim();
                    links[idx].productId = $('#pinfo_propinfo > div:nth-child(1) > div:nth-child(2)').text().trim();
                    links[idx].storeProductId = storeProductId;

                } else if (element.status === 200 && element.config.url.includes('https://cdon.fi/')) {
                    let $ = cheerio.load(element.data);
                    if (element.config.url.includes('kesaale/tietokoneet/naytot/')) {
                        let idx = links.findIndex(item => item.url === element.config.url);
                        links[idx].productId = $('#energy-label__datasheet-popup > tbody > tr > th').filter(function(i, el) {
                            return $(this).text() === 'Valmistajan tuotenumero';
                        }).next().text().trim();

                    }

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
/**
 * Just a test function to check that the selectors work.
 * @param {String} url 
 */
function saveTestHTML(url) {
    //return axios.get(url, {headers: {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0'}})
    return axios.get(url)
        .then(function (response) {
            if (response.status === 200) {
                //const json = response.data;
                //const headers = response.request;
                //console.log(headers);
                let $ = cheerio.load(response.data);
                console.log($('#energy-label__datasheet-popup > tbody > tr > th').filter(function(i, el) {
                    return $(this).text() === 'Valmistajan tuotenumero';
                }).next().text().trim());
                
                //let article = $('main > section > ul > li').first().children().first();
                //let name = article.children().first().attr('value');
                //let storeProductId = article.children().eq(1).attr('value');
                //let categoryString = article.children().eq(2).attr('value').split('/').splice(-1, 1)[0];
                //let salePrice = article.children('div.product-price-wrapper').children().first().text().trim();
                //let normalPrice = article.children('div.product-price-wrapper').children().eq(1).text().trim();
                //console.log(name, storeProductId, categoryString, salePrice, normalPrice);
                /*
                fs.writeFile('apitest.json',
                JSON.stringify(json, null, 4),
                (err) => console.log('File successfully written!'));
                */


            }
        }, function (err) {
            console.log("Description fetching error [saveTestHTML]: ", err);
        })

}
saveTestHTML('https://cdon.fi/kodin-elektroniikka/acer-31-5-led-eb321hqua-p40945618');