'use strict'
var axios = require('axios');
var cheerio = require('cheerio');
var fs = require('fs');
var parseData = require('./parser.js')
//'https://www.jimms.fi/'

/**
 * Fetches data from a website defined by url.
 * @param {String} url 
 */
exports.getData = function(url) {
  return axios.get(url)
       .then(function(response) {
         if(response.status === 200) {
           const html = response.data;
           const $ = cheerio.load(html);

           var productList = []
           $('div.pcol > div.productitem').each(function(i, elem) {
             productList[i] = {
               pname: $(this).children('.p_name').children().first().text().trim(),
               currentPrice: $(this).children('.p_bottom').children('.p_price').first().text().trim(),
               url: $(this).children('.p_name').children().first().attr('href'),
             }
           });
           productList.shift();
           var pListTrimmed = productList.filter(n => n != undefined );
           pListTrimmed = parseData.parseArr(pListTrimmed);
           /*
           fs.writeFile('productList.json',
                JSON.stringify(pListTrimmed, null, 4),
                (err)=> console.log('File successfully written!'));
          */
         }
       }, function(reason) {
          console.log("error", err);
       }
}
