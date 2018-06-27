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
    
    productId: String,                  // ProductId from store page

    productUrl: String,                 // Url of the product page

    store: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: 'Store'
    },
    latestSaleDate: {
        type: Date,
        default: Date.now,
    },
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
        },
        storeId: {
            type: String,
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

// Virtual getter to a better formatted date.
productSchema.virtual('formattedDate').get(function () {
    return new Date(this.dateCreated).toDateString();
});

productSchema.set('toObject', { getters: true });

productSchema.set('toObject', { virtuals: true });
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);