const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/auth');
var User = require('../models/user.model');
const { validate, Joi } = require('express-validation');

const userValidation = {
    body: Joi.object({
        username: Joi.string()
            .email()
            .required(),
        password: Joi.string()
            .regex(/[a-zA-Z0-9]{3,30}/)
            .required(),
        roles: Joi.array()
            .required()
    })
};

router.post('', auth, validate(userValidation, {}, {}), async function (req, res) {
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
                    createdby: req.sessionUser.username
                });
                newUser.save().then(_ => {
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

router.get('', auth, async (req, res) => {
    var users = await User.find().catch((err) => {
        console.log(err);
        res.status(500).json({
            status: 500,
            message: "Error fetching list of users"
        });
    });
    var response = [];
    users.map((v, _) => {
        response.push({
            id: v._id,
            username: v.username,
            roles: v.roles,
            permissions: v.permissions,
            lastsession: v.lastsession,
            lastsessionend: v.lastsessionend,
            currentsession: v.currentsession,
            createdat: v.createdat,
            createdby: v.createdby,
        })
    });
    res.status(200).json({
        status: 200,
        message: "Success",
        data: response
    });
});

router.get('/:id', auth, async (req, res) => {
    let id = req.params.id;
    var v = await User.findById(id).catch(err => {
        res.status(500).json({
            status: 500,
            message: "Error finding user."
        });
    });
    if (!v)
        res.status(404).json({
            status: 404,
            message: "User not found"
        });
    else
        res.status(200).json({
            status: 200,
            message: "User found",
            data: {
                id: v._id,
                username: v.username,
                roles: v.roles,
                permissions: v.permissions,
                lastsession: v.lastsession,
                lastsessionend: v.lastsessionend,
                currentsession: v.currentsession,
                createdat: v.createdat,
                createdby: v.createdby,
            }
        });
});

router.delete('/:id', auth, async (req, res) => {
    let id = req.params.id;
    await User.findByIdAndDelete(id)
        .then(_ => {
            res.status(200).json({
                status: 200,
                message: "Deleted user successfully."
            });
        })
        .catch(err => {
            res.status(500).json({
                status: 500,
                message: "Error deleting user."
            });
        });
});

module.exports = router;