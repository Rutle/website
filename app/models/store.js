'use strict'
// app/models/project.js
// Javascript file for MongoDB project-schema intended for storing projects.
// Useful info: https://alexanderzeitler.com/articles/mongoose-referencing-schema-in-properties-and-arrays/

var mongoose = require('mongoose');

// MongoDB schema for a project model.
var storeSchema = mongoose.Schema({
    name: {                             // Name of the product
        type: String,
        required: [true, 'Name is required.'],
        unique: true,
        dropDups: true
    },

    url: {                         // Url of the product page
        type: String,
        required: [true, 'URL is required.'],
        unique: true,
        dropDubs: true                 
    },

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