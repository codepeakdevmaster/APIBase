const jwt = require('jsonwebtoken');
var User = require('../models/user.model');

async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const thisToken = authHeader && authHeader.split(' ')[1]

    if (thisToken == null) return res.status(401).json({
        status: 401,
        message: "Not authorized."
    });

    var usr = await User.findOne({ token: thisToken }).catch((er) => {
        console.log(er);
        return res.status(401).json({
            status: 401,
            message: "Not authorized"
        });
    });

    if (!usr) {
        console.log("No active session for this user");
        return res.status(401).json({
            status: 401,
            message: "Not authorized."
        });
    }

    jwt.verify(thisToken, process.env.TOKEN_SECRET || 'QWCPDAILYKey', (err, user) => {
        if (err) {
            console.log(err)
            return res.status(403).json({
                status: 403,
                message: "Not authorized."
            });
        }
        req.sessionUser = user

        next()
    })
}

module.exports = authenticateToken;