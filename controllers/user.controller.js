const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
var User = require('../models/user.model');
const { validate, Joi } = require('express-validation');

const userValidation = {
    body: Joi.object({
        name: Joi.string()
            .required(),
        phone: Joi.string()
            .required(),
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

router.post('', validate(userValidation, {}, {}), async function (req, res) {
    let request = req.body;
    console.log(request);
    let user = await User.getUserByUsername(request.username)
        .catch((err) => {
            console.log("Error looking for user.");
            console.log(err);
            return res.Error("Error creating user.");
        });
    if (!user) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                console.log('genSalt Error');
                console.log(err);
                return res.Error("Error creating user.");
            }
            bcrypt.hash(request.password, salt, function (err, hash) {
                if (err) {
                    console.log('hash Error');
                    console.log(err);
                    return res.Error("Error creating user.");
                }
                var newUser = new User({
                    username: request.username,
                    name: request.name,
                    phone: request.phone,
                    password: hash,
                    roles: request.roles,
                    lastsession: null,
                    lastsessionend: null,
                    currentsession: null,
                    token: null,
                    createdat: Date.now(),
                    createdby: req.sessionUser.username
                });
                newUser.save()
                    .then(_ => { return res.Success("User created successfully."); })
                    .catch(err => {
                        console.log(newUser);
                        console.log("General error in user creation.");
                        console.log(err);
                        return res.Error("Error creating user.");
                    });
            });
        });
    } else return res.Exists("The user already exists");
});

router.get('', async (req, res) => {
    var users = await User.find()
        .catch((err) => {
            console.log(err);
            return res.Exception("Error fetching list of users.");
        });
    var response = [];
    users.map((v, _) => {
        if (v.username != 'recover@codepeak.com' && v.username != req.sessionUser.username) {
            response.push({
                id: v._id,
                username: v.username,
                name: v.name,
                phone: v.phone,
                roles: v.roles,
                permissions: v.permissions,
                lastsession: v.lastsession,
                lastsessionend: v.lastsessionend,
                currentsession: v.currentsession,
                secchanged: v.secchanged,
                createdat: v.createdat,
                createdby: v.createdby,
                updatedat: v.updatedat,
                updatedby: v.updatedby,
            });
        }
    });
    return res.Success("Success", response);
});

router.get('/:id', async (req, res) => {
    let id = req.params.id;
    var v = await User.findById(id)
        .catch(err => {
            return res.Exception("Error finding user.");
        });
    if (!v) return res.NotFound("User not found.");
    else return res.Success("User found", {
        id: v._id,
        username: v.username,
        name: v.name,
        phone: v.phone,
        roles: v.roles,
        permissions: v.permissions,
        lastsession: v.lastsession,
        lastsessionend: v.lastsessionend,
        currentsession: v.currentsession,
        secchanged: v.secchanged,
        createdat: v.createdat,
        createdby: v.createdby,
        updatedat: v.updatedat,
        updatedby: v.updatedby,
    });
});

router.delete('/:id', async (req, res) => {
    let id = req.params.id;
    await User.findByIdAndDelete(id)
        .then(_ => {
            return res.Success("Deleted user successfully.");
        })
        .catch(err => {
            return res.Exception("Error deleting user.");
        });
});

module.exports = router;