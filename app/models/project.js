'use strict'
// app/models/project.js
// Javascript file for MongoDB project-schema intended for storing projects.
// Useful info: https://alexanderzeitler.com/articles/mongoose-referencing-schema-in-properties-and-arrays/

var mongoose = require('mongoose');

// MongoDB schema for a project model.
var projectSchema = mongoose.Schema({
    author: {                           // ObjectId of the author of the project.
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {                             // Project title.
        type: String,
        required: true
    },

    repositoryName: {                       // Name of the Github repository.
        type: String,
        unique: true,
        dropDups: true,
    },             

    websiteProjectURL: {// For apps on website.
        type: String,
        unique: true,
        dropDups: true,
    },      

    websiteProject: Boolean,

    shortName: {
        type: String,                  // If lacking repository
        unique: true,
        dropDups: true,
    },
    /*
    sections: [{                        // Sections and text on a project page.
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        }
    }],*/

    dateCreated: {
        type: Date,
        default: Date.now
    },

    dateModified: {
        type: Date,
        default: Date.now
    }

});

// Virtual getter to a better formatted date.
projectSchema.virtual('formattedDate').get(function () {
    return new Date(this.dateCreated).toDateString();
});
projectSchema.set('toObject', { getters: true });
projectSchema.set('toObject', { virtuals: true });
projectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
