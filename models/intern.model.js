const mongoose = require('mongoose');

let InternSchema = mongoose.Schema({
    userid: {
        type: String,
        default: ''
    },
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
    batchid: {
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

var Intern = module.exports = mongoose.model('Intern', InternSchema);