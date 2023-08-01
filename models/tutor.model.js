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

var Tutor = module.exports = mongoose.model('Tutor', TutorSchema);

module.exports.getTutorByEmail = async function (email) {
    var query = { email: email };
    var tutor = await Tutor.findOne(query);
    return tutor;
};