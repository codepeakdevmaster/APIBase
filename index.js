require("dotenv").config();

///
/// Web root
///
const express = require('express'),
    http = require('http'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

///
/// Utils
///
const cors = require('cors'),
    compression = require('compression'),
    logger = require('morgan');

///
/// Swagger UI
///
const swaggerJsdoc = require("swagger-jsdoc"),
    swaggerUi = require("swagger-ui-express");

const { ValidationError } = require('express-validation');

const db = require("./config/database.config");
///
/// Controllers
///
const auth = require('./controllers/auth.controller'),
    user = require('./controllers/user.controller'),
    course = require('./controllers/course.controller'),
    batch = require('./controllers/batch.controller'),
    lead = require('./controllers/lead.controller'),
    tutor = require('./controllers/tutor.controller'),
    intern = require('./controllers/intern.controller'),
    ledger = require('./controllers/ledger.controller'),
    review = require('./controllers/review.controller');

///
/// Middlewares
///
var Response = require('./middlewares/response.middleware'),
    Authorize = require('./middlewares/auth.middleware');



const app = express();
app.use(cors());
app.use(logger(function (tokens, req, res) {
    return [
        Date(),
        req.headers['authorization'] ? '[WA]' : '[WOA]',
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms'
    ].join(' ');
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());

app.use(Response);
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Codepeak Track 8 API Base',
            version: '1.0.0',
            description:
                'This is the REST API for Track 8 and child applications',
            license: {
                name: 'Licensed Under MIT',
                url: 'https://spdx.org/licenses/MIT.html',
            },
            contact: {
                name: 'Codepeak Technologies',
                url: 'https://codepeaktechnologies.com/',
            },
        },
        servers: [
            {
                url: 'http://localhost:4000',
                description: 'Development server',
            },
            {
                url: 'https://cpdaily-api.onrender.com',
                description: 'Production server',
            }
        ],
    },
    apis: ["./controllers/*.js"],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// var noAuthUrls = ["/", "/ping", "/auth/login", "/auth/ilogin", "/review"];
// app.use((req, res, next) => { noAuthUrls.includes(req.url) ? next() : Authorize(false, req, res, next); });



app.get('/', (_, res) => {
    console.log("Someone checked on our servers.");
    res.Success('CodepeakDaily API is up and running');
})

app.get('/ping', (_, res) => {
    console.log('Someone checked our hartbeat, and what? Our heart is beating in the perfect order.');
    res.Success('Pong! CodepeakDaily API is up and running.');
});

app.use('/auth/logout', (req, res, next) => {
    Authorize(false, req, res, next);
}, auth);
app.use('/auth/resetpassword', (req, res, next) => {
    Authorize(false, req, res, next);
}, auth);
app.use('/auth/updatepassword', (req, res, next) => {
    Authorize(false, req, res, next);
}, auth);
app.use('/auth', (req, res, next) => { next(); }, auth);

// Special Authorizations
app.use('/review/listall', (req, res, next) => {
    Authorize(false, req, res, next);
}, review);
app.use('/review', (req, res, next) => {
    Authorize(true, req, res, next);
}, review);
app.use('/review/byintern', (req, res, next) => {
    Authorize(true, req, res, next);
}, review);
app.use('/review/byinternonday', (req, res, next) => {
    console.log('From here');
    Authorize(true, req, res, next);
}, review);

// Default Authorization
app.use((req, res, next) => { Authorize(false, req, res, next); }); 
app.use('/user', user);
app.use('/course', course);
app.use('/batch', batch);
app.use('/lead', lead);
app.use('/lead/setintern', lead);
app.use('/tutor', tutor);
app.use('/tutor/setuser', tutor);
app.use('/intern', intern);
app.use('/intern/setuser', intern);
app.use('/ledger', ledger);


app.use(function (err, req, res, next) {
    if (err instanceof ValidationError) {
        console.log(req.body);
        console.error(err);
        console.log(err.details);
        return res.Custom(err.statusCode, err.error);
    }
    return res.Custom(500, "Wrong request", err);
});
//set port
var port = (process.env.PORT || 4000);
app.set('port', port);

var server = http.createServer(app);

server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ?
        'Pipe ' + port :
        'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ?
        'pipe ' + addr :
        'port ' + addr.port;
    console.log('Listening on ' + bind);
}

server.listen(app.get('port'), function () {
    console.log(`Server started on port ${app.get('port')}`);
    db.connect();
});

