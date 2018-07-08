'use strict'
// app/models/project.js
// Javascript file for MongoDB project-schema intended for storing projects.
// Useful info: https://alexanderzeitler.com/articles/mongoose-referencing-schema-in-properties-and-arrays/

var mongoose = require('mongoose');

// MongoDB schema for a project model.
var storeSchema = mongoose.Schema({
    name: {                             // Name of the store
        type: String,
        required: [true, 'Name is required.'],
        unique: true,
        dropDups: true
    },
    url: {                         // Base url  of the store
        type: String,
        required: [true, 'URL is required.'],
        unique: true,
        dropDubs: true                 
    },
    campaignUrls: [{            // Campaigns etc.
        name: {
            type: String
        },
        url: {
            type: String,
        },
        isActive: {
            type: Boolean,
            default: true
        }  
    }],
    keywords: [{
        type:String
    }],
    dateCreated: {                      // Date when this store was created.
        type: Date,
        default: Date.now
    },
    dateModified: {                     // Modification date.
        type: Date,
        default: Date.now
    },

});

module.exports = mongoose.model('Store', storeSchema);