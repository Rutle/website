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

var matchList = ['(Tarjous', '*Tarjous', 'Tarjous','*Normaalihinta', '*normaalihinta'];
var jimmsUrl = "https://www.jimms.fi";


/**
 * Parses an array containing objects.
 * @param {Array} objectList 
 */
exports.parseArr = function(objectList) {

  var newObjectList = [];
  var newCounter = 0;

  for(var i = 0; i < objectList.length; i++) {
    var indexBegin = objectList[i].pname.indexOf(containsAny(objectList[i].pname, matchList));
    if(indexBegin !== -1) {
      var productItem = objectList[i].pname.slice(0, indexBegin).trim();
      var tarjousStr = objectList[i].pname.slice(indexBegin, objectList[i].pname.length);
      var price = tarjousStr.match(/\d+(?:\,\d+)?/g);

      newObjectList[newCounter] = {
        pname: productItem,
        currentPrice: parseFloat(objectList[i].currentPrice.match(/\d+(?:\,\d+)?/g)),
        url: jimmsUrl+objectList[i].url,
        regularPrice: parseFloat(price),
        productCode: ""
      }
      newCounter++;

    } else {
      console.log("Skipped..\n")
    }
  }
  return newObjectList;
}
