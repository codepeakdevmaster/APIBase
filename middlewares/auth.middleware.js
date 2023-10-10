const jwt = require('jsonwebtoken');
var User = require('../models/user.model');
var Intern = require('../models/intern.model');

async function authenticateToken(checkIntern = false, req, res, next) {
    const authHeader = req.headers['authorization']
    const thisToken = authHeader && authHeader.split(' ')[1]

    if (thisToken == null) return res.status(401).json({
        status: 401,
        message: "Not authorized."
    });

    var usr = await User.findOne({ token: thisToken }).catch((er) => {
        console.error(er);
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
    var intern = null;
    if (checkIntern) {
        // check for intern existance
        intern = await Intern.getInternByUserId(usr._id);
        if (!intern) {
            console.log("No active session for intern user");
            return res.status(401).json({
                status: 401,
                message: "Not authorized."
            });
        }
    }

    jwt.verify(thisToken, process.env.TOKEN_SECRET || 'QWCPDAILYKey', (err, user) => {
        if (err) {
            console.error(err)
            return res.status(403).json({
                status: 403,
                message: "Not authorized."
            });
        }
        // console.log(user);
        req.sessionUser = user

        next()
    })
}

module.exports = authenticateToken;