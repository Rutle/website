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
           return pListTrimmed;
           /*
           fs.writeFile('productList.json',
                JSON.stringify(pListTrimmed, null, 4),
                (err)=> console.log('File successfully written!'));
          */
         }
       }, function(reason) {
          console.log("error ", err);
       })
       .then(function(data) {
        let linkArray = data.map(obj => obj.url);
       }, function(error) {
           console.log("error ", err)
       });
}
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
    
  }, function(reason) {
    console.log("error", err);
})
.then(function(response) {
    console.log("toka:", response)
});*/
return axios.get('https://www.jimms.fi/fi/Product/Show/77490/3303/qpad-qh-85-pro-gaming-headset-musta-tarjous-norm-79_90eur')
  .then(function(response) {
    if(response.status === 200) {
      const json = response.data;
      const headers = response.headers;
      //console.log("eka: ", json);
    
    fs.writeFile('product.json',
         JSON.stringify(json, null, 4),
         (err)=> console.log('File successfully written!'));
    
    return json;   
    }
    
  }, function(reason) {
    console.log("error", err);
})
.then(function(response) {
    //console.log("toka:", response)

    const $ = cheerio.load(response);
    //console.log(response);
    let category = $('.breadcrumb').children().last().prev().children('a').first().children('span').first().text();
    let categoryUrl = $('.breadcrumb').children().last().prev().children('a').first().attr('href');
    console.log(category);

}, function(error) {
    console.log("error2: ", error);
});