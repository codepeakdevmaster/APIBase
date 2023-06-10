const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
var User = require('../models/user.model');
const { validate, Joi } = require('express-validation')
var Authorize = require('./middlewares/auth.middleware');

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
                        permissions: []
                    });
                }
            }
        });
    }
});

router.post('/logout', Authorize, async (req, res) => {
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

module.exports = router;