const jwt = require('jsonwebtoken');
var User = require('../models/user.model');
var Intern = require('../models/intern.model');

async function authenticateToken(checkIntern, req, res, next) {
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
    console.log(`checkIntern : ${checkIntern}`);
    var intern = null;
    // check for intern existance
    intern = await Intern.getInternByUserId(usr._id);
    if (checkIntern == true) {
        if (!intern) {
            console.log("No active session for intern user");
            return res.status(401).json({
                status: 401,
                message: "Not authorized."
            });
        }
    } else {
        if (intern) {
            console.log(`Intern user ${intern._id} ${intern.name} tried to access the main api`);
            return res.status(401).json({
                status: 401,
                message: "Not authorized."
            });
        } else {
            const restrictedRoles = ["intern", "tutor"]; 
            const containsRestrictedRoles = usr.roles.some(item => {return restrictedRoles.includes(item);});
            if(containsRestrictedRoles) {
                console.log(`Actions on main API blocked for ${usr._id} as the role dont have permission.`);
                return res.status(401).json({
                    status: 401,
                    message: "Not authorized."
                });
            }
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