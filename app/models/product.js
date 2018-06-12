'use strict'
// app/models/project.js
// Javascript file for MongoDB project-schema intended for storing projects.
// Useful info: https://alexanderzeitler.com/articles/mongoose-referencing-schema-in-properties-and-arrays/

var mongoose = require('mongoose');

// MongoDB schema for a project model.
var productSchema = mongoose.Schema({
    name: {                             // Name of the product
        type: String,
        required: true,
    },
    category: {                         // Category of the item
        type: String,
        required: true
    },

    miscText: {                         // Any extra text that might have been extracted.
        type: String,
        required: false
    },

    productId: String,                  // ProductId from store page

    productUrl: String,                 // Url of the product page

    store: [{                           // Store where the data was extracted.
        name: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    }],

    salesDates: [{                      // Sales data
        salePrice: {
            type: Number,
            required: true
        },
        normalPrice: {
            type: Number,
            required: true
        },
        dateOfSale: {
            type: Date,
            default: Date.now
        }
    }],

    dateCreated: {                      // Date when this product was found.
        type: Date,
        default: Date.now
    },

    dateModified: {                     // Modification date.
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Product', productSchema);