const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var User = require('../models/user.model');
var Intern = require('../models/intern.model');
const { validate, Joi } = require('express-validation')
var Authorize = require('../middlewares/auth.middleware');

const loginValidation = {
    body: Joi.object({
        username: Joi.string()
            .email()
            .required(),
        password: Joi.string()
            .regex(/[a-zA-Z0-9]{3,30}/)
            .required(),
    }),
};

router.post('/login', validate(loginValidation, {}, {}), async (req, res) => {
    let request = req.body;
    var user = await User.findOne({ username: request.username });
    if (!user) return res.NotFound("User not found");
    else {
        // console.log(user.password);
        User.comparePassword(request.password, user.password, async function (err, isMatch) {
            if (err) {
                console.log(err);
                return res.NotFound("User not found");
            } else {
                if (!isMatch) return res.NotFound("User not found");
                else {
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
                            {
                                expiresIn: "168h",
                            }
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
                    return res.Success("User found", {
                        token: user.token,
                        roles: user.roles,
                        name: user.name,
                        secchanged: user.secchanged,
                        phone: user.phone,
                        permissions: []
                    });
                }
            }
        });
    }
});

router.post('/ilogin', validate(loginValidation, {}, {}), async (req, res) => {
    let request = req.body;
    var user = await User.findOne({ username: request.username });
    if (!user) return res.NotFound("User not found");
    else {
        ///
        /// Checks if the user is an intern and if not returns 404.
        ///
        if (!user.roles.includes("intern")) return res.NotFound("User not found");
        ///
        /// If yes then moving forward for validating password and adding session.
        ///
        User.comparePassword(request.password, user.password, async function (err, isMatch) {
            if (err) {
                console.log(err);
                return res.NotFound("User not found");
            } else {
                if (!isMatch) return res.NotFound("User not found");
                else {
                    if (!user.currentsession) {
                        user.currentsession = Date.now();
                    } else {
                        user.lastsession = user.currentsession;
                        user.currentsession = Date.now();
                    };
                    // fetching the intern details for userid
                    var intern = await Intern.getInternByUserId(user._id);
                    let token;
                    try {
                        //Creating jwt token
                        token = jwt.sign(
                            {
                                userId: user._id, username: user.username,
                                roles: user.roles, internid: intern._id,
                                courseid: intern.courseid,
                                batchid: intern.batchid
                            },
                            process.env.TOKEN_SECRET || "QWCPDAILYKey",
                            {
                                expiresIn: "168h",
                            }
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
                    return res.Success("User found", {
                        token: user.token,
                        name: user.name,
                        secchanged: user.secchanged,
                        phone: user.phone,
                        courseid: intern.courseid,
                        batchid: intern.batchid,
                        email: intern.email,
                        qualification: intern.qualification,
                    });
                }
            }
        });
    }
});

router.post('/logout', async (req, res) => {
    await User.findByIdAndUpdate(req.sessionUser.userId, {
        token: null,
        lastsessionend: Date.now(),
        currentsession: null
    })
        .then(_ => { return res.Success("Logged out successfully."); })
        .catch((err) => {
            console.log(err);
            return res.Exception("Something went wrong! Please try again later.");
        });
});

router.post('/resetpassword', async (req, res) => {
    let request = req.body; // Request Body structure => {currentpassword: "", newpassword:""}
    var user = await User.findOne({ username: req.sessionUser.username });
    if (!user) return res.NotFound("User not found");
    else {
        User.comparePassword(request.currentpassword, user.password, async function (err, isMatch) {
            if (err) {
                console.log(err);
                return res.Error("Error validating your current password. Please try again later.");
            } else {
                if (!isMatch) return res.Error("You entered a wrong password. Please check your current password.");
                else {
                    bcrypt.genSalt(10, function (err, salt) {
                        if (err) {
                            console.log('genSalt Error on password reset');
                            console.log(err);
                            return res.Error("Error updating password.");
                        }
                        bcrypt.hash(request.newpassword, salt, async function (err, hash) {
                            if (err) {
                                console.log('hash Error on password reset');
                                console.log(err);
                                return res.Error("Error updating password.");
                            }
                            await User.findByIdAndUpdate(req.sessionUser.userId, {
                                password: hash,
                                secchanged: true,
                                updatedat: Date.now(),
                                updatedby: req.sessionUser.username
                            })
                                .then(_ => {
                                    return res.Success("Your password updated successfully.");
                                })
                                .catch(err => {
                                    return res.Exception("Error updating password.");
                                });;
                        });
                    });
                }
            }
        });
    }
});

router.post('/updatepassword', async (req, res) => {
    let request = req.body; // Request Body structure => { newpassword:"" }
    var user = await User.findOne({ username: req.sessionUser.username });
    if (!user) return res.NotFound("User not found");
    else {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                console.log('genSalt Error on password update');
                console.log(err);
                return res.Error("Error updating password.");
            }
            bcrypt.hash(request.newpassword, salt, async function (err, hash) {
                if (err) {
                    console.log('hash Error on password reset');
                    console.log(err);
                    return res.Error("Error updating password.");
                }
                await User.findByIdAndUpdate(req.sessionUser.userId, {
                    password: hash,
                    secchanged: true,
                    updatedat: Date.now(),
                    updatedby: req.sessionUser.username
                })
                    .then(_ => {
                        return res.Success("Your password updated successfully.");
                    })
                    .catch(err => {
                        return res.Exception("Error updating password.");
                    });;
            });
        });
    }
});

module.exports = router;