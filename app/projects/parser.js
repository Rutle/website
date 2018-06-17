'use strict'
function containsAny(str, substrings) {
    for (var i = 0; i != substrings.length; i++) {
       var substring = substrings[i];
       if (str.indexOf(substring) != - 1) {
         return substring;
       }
    }
    return null;
}

var matchListJimms = ['(Tarjous', '*Tarjous', 'Tarjous','*Normaalihinta', '*normaalihinta', '*Demonäyttö,normaalihinta', '*Norm.'];
var matchListVerk = [];
var jimmsUrl = "https://www.jimms.fi/";
var verkkokauppa = "https://www.verkkokauppa.com/"


/**
 * Parses an array containing objects.
 * @param {Array} objectList 
 */
exports.parseArr = function(objectList, url) {

  var newObjectList = [];
  var newCounter = 0;
  if (url === jimmsUrl) {
    for(var i = 0; i < objectList.length; i++) {
        var indexBegin = objectList[i].pname.indexOf(containsAny(objectList[i].pname, matchListJimms));
        if(indexBegin !== -1) {
          var productItem = objectList[i].pname.slice(0, indexBegin).trim();
          var tarjousStr = objectList[i].pname.slice(indexBegin, objectList[i].pname.length);
          var price = tarjousStr.match(/\d+(?:\,\d+)?/g);
    
          newObjectList[newCounter] = {
            pname: productItem,
            currentPrice: parseFloat(objectList[i].currentPrice.match(/\d+(?:\,\d+)?/g)),
            url: jimmsUrl.slice(0, -1)+objectList[i].url,
            regularPrice: parseFloat(price),
            productId: "",
            category: "",
            categoryUrl: ""
          }
          newCounter++;
    
        } else {
          console.log("Skipped..\n")
        }
      }
    return newObjectList;
  }
}
