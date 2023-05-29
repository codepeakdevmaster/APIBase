const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
var User = require('../models/user.model');

router.post('/create', auth, async function (req, res) {
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

router.post('/login', async function (req, res) {
    let request = req.body;
    var user = await User.findOne({ username: request.username });
    if (!user) {
        res.status(404).json({
            status: 404,
            message: "User not found."
        });
    } else {
        User.comparePassword(request.password, user.password, async function (err, isMatch) {
            if (err) {
                console.log(err);
                res.status(404).json({
                    status: 404,
                    message: "User not found."
                });
            } else {
                if (!isMatch) {
                    res.status(404).json({
                        status: 404,
                        message: "User not found."
                    });
                } else {
                    if (!user.currentsession) {
                        user.currentsession = Date.now();
                    } else {
                        user.lastsession = user.currentsession;
                        user.currentsession = Date.now();
                    };
                    let token;
                    try {
                        //Creating jwt token
                        token = jwt.sign(
                            { userId: user._id, username: user.username },
                            process.env.TOKEN_SECRET || "QWCPDAILYKey",
                        );
                    } catch (err) {
                        console.log(err);
                        const error = new Error("Error! Something went wrong.");
                        return next(error);
                    }
                    user.token = token;
                    await User.findByIdAndUpdate(user._id, {
                        currentsession: user.currentsession,
                        lastsession: user.lastsession, token: user.token
                    }).catch((er) => {
                        console.log("Error updating the session for " + user.username);
                        console.log(er);
                    });
                    res.status(200).json({
                        status: 200,
                        message: 'User found',
                        data: {
                            token: user.token,
                            roles: user.roles,
                            permissions: []
                        }
                    });
                }
            }
        });
    }
});

router.post('/logout', function (req, res) {

});

module.exports = router;