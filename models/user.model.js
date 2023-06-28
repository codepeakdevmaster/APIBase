const mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

let UserSchama = mongoose.Schema({
    username: {
        type: String,
        index: true,
        default: '',
    },
    name: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
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
    updatedat: {
        type: Date,
        default: null
    },
    updatedby: {
        type: String,
        default: ''
    },
});

var User = module.exports = mongoose.model('User', UserSchama);

module.exports.getUserByUsername = async function (username) {
    var query = { username: username };
    var user = await User.findOne(query);
    return user;
};

module.exports.getUserById = async function (id) {
    var user = await User.findById(id);
    return user;
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