const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchama = new Schema({
    // _id: {type: String},
    username: {
        type: String,
        index: true,
    },
    roles: {
        type: Array,
    },
    password: { type: String },
    lastsession: { type: Date },
    currentsession: { type: Date },
    token: { type: String },
    createdat: { type: Date },
    createdby: { type: String },
});

var user = module.exports = mongoose.model('User', UserSchama);