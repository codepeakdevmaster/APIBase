const mongoose = require('mongoose');

let ReviewSchema = mongoose.Schema({
    internid: {
        type: String,
        default: ''
    },
    tutorid: {
        type: String,
        default: ''
    },
    year: {
        type: Number,
        default: null
    },
    month: {
        type: Number,
        default: null
    },
    day: {
        type: Number,
        default: null,
    },
    comment: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 0,
    },
    createdat: {
        type: Date,
        default: null
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

var Review = module.exports = mongoose.model("Review", ReviewSchema);