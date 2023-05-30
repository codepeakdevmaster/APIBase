const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
var User = require('../models/user.model');

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
                            { userId: user._id, username: user.username, roles: user.roles },
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