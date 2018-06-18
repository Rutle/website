'use strict'
var axios = require('axios');
var cheerio = require('cheerio');
var fs = require('fs');
var parseData = require('./parser.js')
var urlList = ['https://www.jimms.fi/','https://www.verkkokauppa.com/'];

/**
 * Fetches data from a website defined by url.
 * @param {String} urlList
 */
//exports.getData = function (urlList) {
return axios.all(urlList.map(l => axios.get(l))
/*  [axios.get('https://www.jimms.fi/'),
    axios.get('https://www.verkkokauppa.com/')]*/
)
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

                // Parse relevant data and modify it to desired format.
                productList = parseData.parseArr(productList, args[i].config.url);

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
        console.log("Eka site data: ", siteData.filter(function(l) {
            return l.status === 200;
        }).map((li) => li.url ));
        
        return siteData;
        /*
        if (response.status === 200) {
            const html = response.data;
            const $ = cheerio.load(html);

            var productList = []
            $('div.pcol > div.productitem').each(function (i, elem) {
                productList[i] = {
                    pname: $(this).children('.p_name').children().first().text().trim(),
                    currentPrice: $(this).children('.p_bottom').children('.p_price').first().text().trim(),
                    url: $(this).children('.p_name').children().first().attr('href'),
                }
            });
            // Remove first element from array.
            productList.shift();

            // Clean up undefined elements.
            var pListTrimmed = productList.filter(n => n != undefined);

            // Parse relevant data and modify it to desired format.
            pListTrimmed = parseData.parseArr(pListTrimmed);

            // Return axios promise object.
            return pListTrimmed;
            /*
            fs.writeFile('productList.json',
                 JSON.stringify(pListTrimmed, null, 4),
                 (err)=> console.log('File successfully written!'));
           
    }*/
    }, function (err) {
        console.log("First error ", err);
    }))
    .then(function (data) {
        // Fetch each product's category and productId information, that are on sale.
        return getProductPages(data).then(function(refinedData) {
            console.log("refined Data: ", refinedData);
            return refinedData;
        }, function(error) {
            console.log("Error [getProductPages]: ", error);
        })

    }, function (error) {
        console.log("Second error ", error)
    });
//}
/*
return axios.get('https://api.github.com/repos/rutle/website/commits?per_page=3&sha=master')
  .then(function(response) {
    if(response.status === 200) {
      const json = response.data;
      const headers = response.headers;
      console.log("eka: ", json);
    
    fs.writeFile('apitest.json',
         JSON.stringify(json, null, 4),
         (err)=> console.log('File successfully written!'));
    
    return json;   
    }
    
  }, function(err) {
    console.log("error", err);
})
.then(function(response) {
    console.log("toka:", response)
});*/


/**
 * Function to fetch the page of each given link in links-array and add information back to the array.
 * @param {Array} links 
 */
function getProductPages(links) {
    return axios.all(links.filter(function(l) {
        return l.status === 200
    }).map((li) => axios.get(li.url) ))
        .then(function (results) {
            results.forEach(element => {
                console.log("status: ", element.status)
                if (element.status === 200 && element.config.url.includes('https://www.jimms.fi/')) {
                    let $ = cheerio.load(element.data);
                    console.log("config: ", element.config.url);
                    let idx = links.findIndex(item => item.url === element.config.url);
                    links[idx].category = $('.breadcrumb').children().last().prev().children('a').first().children('span').first().text();
                    links[idx].categoryUrl = $('.breadcrumb').children().last().prev().children('a').first().attr('href');
                    links[idx].productId = $('#pinfo_propinfo > div:nth-child(1) > div:nth-child(2)').text();

                    //let category = $('.breadcrumb').children().last().prev().children('a').first().children('span').first().text();
                    //let categoryUrl = $('.breadcrumb').children().last().prev().children('a').first().attr('href');
                    //let productId = $('#pinfo_propinfo > div:nth-child(1) > div:nth-child(2)').text();
                    console.log('cat: ', links[idx].category);
                    console.log('url: ', links[idx].categoryUrl);
                    console.log('id: ', links[idx].productId, '\n');
                } else if (element.status === 200 && element.config.url.includes('https://www.verkkokauppa.com/')) {
                    let idx = links.findIndex(item => item.url === element.config.url);
                    links[idx].category = 'Testi'
                    links[idx].categoryUrl = 'Testi'
                    links[idx].productId = 'Testi'

                }
            });
            return links;

        }, function (err) {
            console.log("Third error", err);
        });
}

