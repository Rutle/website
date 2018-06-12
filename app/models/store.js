'use strict'
// app/models/project.js
// Javascript file for MongoDB project-schema intended for storing projects.
// Useful info: https://alexanderzeitler.com/articles/mongoose-referencing-schema-in-properties-and-arrays/

var mongoose = require('mongoose');

// MongoDB schema for a project model.
var storeSchema = mongoose.Schema({
    name: {                             // Name of the product
        type: String,
        required: true,
    },

    storeUrl: String,                 // Url of the product page

    dateCreated: {                      // Date when this product was found.
        type: Date,
        default: Date.now
    },
    
    dateModified: {                     // Modification date.
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Store', storeSchema);