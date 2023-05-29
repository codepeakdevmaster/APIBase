const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.status(401).json({
        status: 401,
        message: "Not authorized."
    });

    jwt.verify(token, process.env.TOKEN_SECRET || 'QWCPDAILYKey', (err, user) => {
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