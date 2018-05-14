// app/models/project.js
// Javascript file for MongoDB Article-schema intended for storing articles.
// Useful info: https://alexanderzeitler.com/articles/mongoose-referencing-schema-in-properties-and-arrays/
// I'm not sure if I should separate the comments into its own Schema.

var mongoose = require('mongoose');

// MongoDB schema for a project model.
var projectSchema = mongoose.Schema({

    name: {                             // Article title.
        type: String,
        required: true
    },

    repositoryName: String,             // Name of the Github repository.

    sections: [{                        // Sections and text on a project page.
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        }
    }],

    dateCreated: {
        type: Date,
        default: Date.now
    },

    dateModified: {
        type: Date,
        default: Date.now
    }

});


module.exports = mongoose.model('Project', projectSchema);
