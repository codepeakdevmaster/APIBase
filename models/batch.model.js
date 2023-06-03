const mongoose = require('mongoose');

let BatchSchema = mongoose.Schema({
    batchname: {
        type: String,
        index: true,
        default: ''
    },
    courseid: {
        type: String,
        default: '',
    },
    seats: {
        type: Number,
        default: 0
    },
    availableseats: {
        type: Number,
        default: 0
    },
    startdate: {
        type: Date,
        default: null,
    },
    enddate: {
        type: Date,
        default: null,
    },
    starttime: {
        type: String,
        default: null
    },
    endtime: {
        type: String,
        default: null
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

var Batch = module.exports = mongoose.model('Batch', BatchSchema);