const mongoose = require('mongoose');

let LeadSchema = mongoose.Schema({
    name: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    qualification: {
        type: String,
        default: ''
    },
    courseid: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: ''
    },
    internid: {
        type: String,
        default: ''
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

var Lead = module.exports = mongoose.model('Lead', LeadSchema);