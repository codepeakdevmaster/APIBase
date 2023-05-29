const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

let UserSchama = mongoose.Schema({
    username: {
        type: String,
        index: true,
        default: '',
    },
    roles: {
        type: Array,
        default: [],
    },
    password: {
        type: String,
        default: ''
    },
    lastsession: {
        type: Date,
        default: null
    },
    lastsessionend: {
        type: Date,
        default: null
    },
    currentsession: {
        type: Date,
        default: null
    },
    token: {
        type: String,
        default: null
    },
    createdat: {
        type: Date,
        default: null
    },
    createdby: {
        type: String,
        default: ''
    },
});

var User = module.exports = mongoose.model('User', UserSchama);

module.exports.getUserByUsername = async function (username) {
    var query = { username: username };
    var res = await User.findOne(query);
    return res;
};

module.exports.getUserById = async function (id) {
    var res = await User.findById(id);
    return res;
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) {
            console.log(err);
        } else {
            callback(null, isMatch);
        }
    });
};