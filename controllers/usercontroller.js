const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
var User = require('../models/user.model');

router.post('', auth, async function (req, res) {
    let request = req.body;
    let user = await User.getUserByUsername(request.username);
    if (!user) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(request.password, salt, function (err, hash) {
                var newUser = new User({
                    username: request.username,
                    password: hash,
                    roles: request.roles,
                    lastsession: null,
                    lastsessionend: null,
                    currentsession: null,
                    token: null,
                    createdat: Date.now(),
                    createdby: request.sessionUser
                });
                newUser.save().then(user => {
                    res.status(200).json({
                        status: 200,
                        message: "User created successfully."
                    });
                }).catch(err => {
                    console.log(err);
                    res.status(400).json({
                        status: 400,
                        message: "Error creating user."
                    });
                });
            });
        });
    } else {
        res.status(409).json({
            status: 409,
            message: "The user already exists."
        });
    }
});

module.exports = router;