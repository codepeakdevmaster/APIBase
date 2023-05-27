const express = require('express');
const router = express.Router();
const passport = require('passport');

var User = require('../models/user.model');

router.post('/login', async function(req, res) {
    let request = req.body;
    let user = await User.findOne({ username: request.username, password: request.password }).catch((er) => {
        console.log(er);
        res.status(500).json({
            status: 500,
            message: "Error finding user"
        })
    });
    if (!user) {
        res.status(404).json({
            status: 404,
            message: 'User not found'
        });
    } else {
        if (!user.currentsession) {
            user.currentsession = Date.now();
        } else {
            user.lastsession = user.currentsession;
            user.currentsession = Date.now();
        };
        user.token = 'testtoken';
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
});

module.exports = router;