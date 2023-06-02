const mongoose = require('mongoose');

let CourseSchema = mongoose.Schema({
    coursename: {
        type: String,
        index: true,
        default: ''
    },
    active: {
        type: Boolean,
        default: true,
    },
    createdat: {
        type: Date,
        default: null,
    },
    createdby: {
        type: String,
        default: ''
    },
    updatedat: {
        type: Date,
        default: null,
    },
    updatedby: {
        type: String,
        default: ''
    }
});

var Course = module.exports = mongoose.model('Course', CourseSchema);
