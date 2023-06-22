const mongoose = require('mongoose');

let TutorSchema = mongoose.Schema({
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
    courses: {
        type: Array,
        default: []
    },
    joindate: {
        type: Date,
        default: null
    },
    releivingdate: {
        type: Date,
        default: null,
    },
    active: {
        type: Boolean,
        default: true
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

var Lead = module.exports = mongoose.model('Tutor', TutorSchema);