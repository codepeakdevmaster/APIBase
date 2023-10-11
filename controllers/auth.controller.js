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

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication APIs
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *      bearerAuth:
 *        type: http
 *        scheme: bearer
 *        bearerFormat: JWT  
 */



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
                            { userId: user._id, username: user.username, roles: user.roles, internid: intern._id },
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

///
/// Login Swagger entry
///
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login API for Track 8.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username.
 *                 example: emailid
 *               password:
 *                 type: string
 *                 description: The password.
 *                 example: password
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: user found
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: the jwt token generated by the api
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDc3M2FhYmU3NGUyOGE1ODQyNzNhNGUiLCJ1c2VybmFtZSI6ImFkbWluQGNvZGVwZWFrLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTY5NjkzNzE4MCwiZXhwIjoxNjk3NTQxOTgwfQ.RFqPIWNeCLnRtZw1ouIYIe-hVXRTYY41NYWASgU_1XA
 *                     name:
 *                       type: string
 *                       description: the name of the user
 *                       example: codepeak
 *                     secchanged:
 *                       type: boolean
 *                       description: the bit to know if the user configured an own password
 *                       example: true
 *                     phone:
 *                       type: string
 *                       description: the phone number of the user
 *                       example: 9999999999
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: the roles assigned to the user
 *                       example: ["admin", "tutor", "..."]
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: the permissions assigned to the user
 *                       example: []
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 404
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: user not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Server error
*/


///
/// iLogin Swagger entry
///
/**
 * @swagger
 * /auth/ilogin:
 *   post:
 *     summary: Login API for T8IRA.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username.
 *                 example: emailid
 *               password:
 *                 type: string
 *                 description: The password.
 *                 example: password
 *     responses:
 *       200:
 *         description: Logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: user found
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: the jwt token generated by the api
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDc3M2FhYmU3NGUyOGE1ODQyNzNhNGUiLCJ1c2VybmFtZSI6ImFkbWluQGNvZGVwZWFrLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTY5NjkzNzE4MCwiZXhwIjoxNjk3NTQxOTgwfQ.RFqPIWNeCLnRtZw1ouIYIe-hVXRTYY41NYWASgU_1XA
 *                     name:
 *                       type: string
 *                       description: the name of the user
 *                       example: codepeak
 *                     secchanged:
 *                       type: boolean
 *                       description: the bit to know if the user configured an own password
 *                       example: true
 *                     phone:
 *                       type: string
 *                       description: the phone number of the user
 *                       example: 9999999999
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: the roles assigned to the user
 *                       example: ["admin", "tutor", "..."]
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: the permissions assigned to the user
 *                       example: []
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 404
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: user not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Server error
*/

///
/// Logout API
///
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: General Logout API.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Logged out successfully
 *       401:
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Server error
 */


///
/// Reset Password API
///
/**
 * @swagger
 * /auth/resetpassword:
 *   post:
 *     summary: Reset Password API.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentpassword:
 *                 type: string
 *                 description: The current password.
 *                 example: password
 *               newpassword:
 *                 type: string
 *                 description: The new password.
 *                 example: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Password updated successfully
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 400
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Error in processing request
 *       401:
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Unauthorized
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 404
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Server error
 */

///
/// Update Password API
///
/**
 * @swagger
 * /auth/updatepassword:
 *   post:
 *     summary: Update Password API.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newpassword:
 *                 type: string
 *                 description: The new password.
 *                 example: password
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 200
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Password updated successfully
 *       400:
 *         description: Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 400
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Error in processing request
 *       401:
 *         description: Unauthorized request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 401
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Unauthorized
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 404
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: User not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   description: the api call status
 *                   example: 500
 *                 message:
 *                   type: string
 *                   description: the api message
 *                   example: Server error
 */